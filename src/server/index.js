const path = require('path')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const { graphqlUploadExpress } = require('graphql-upload')
const uuid = require('uuid').v4
// const passport = require('passport')
const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')
const cors = require('cors')
const morgan = require('morgan')
const moment = require('moment-timezone')
// const Loaders = require('./src/loaders')

moment.tz.setDefault('Australia/Sydney')

// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const schema = require('./schema')
const router = require('./router')
const db = require('./db')
// const { serializeUser, deserializeUser, localStrategy } = require('./passport')
// const { getDomainNames, generateShortIdBasedOnUuid } = require('./src/utility')

// passport.use(localStrategy(db.models))
// passport.serializeUser(serializeUser)
// passport.deserializeUser(deserializeUser(db.models))

const sequelizeSessionStore = new SequelizeStore({
  db: db.sequelize,
  // https://www.linkedin.com/pulse/why-your-app-needs-short-session-timeout-google-facebook-geoff-wilson/
  // gmail never times out
  expiration: 1000 * 60 * 60 * 24 * 365 // 365 day expiration
})

const app = express()

const origin = function (origin, callback) {
  return callback(null, true)
}

// console.log('process.env.RDS_USERNAME', process.env.RDS_USERNAME)
// console.log('process.env.RDS_PASSWORD', process.env.RDS_PASSWORD)
// console.log('process.env.RDS_DB_NAME', process.env.RDS_DB_NAME)
// console.log('process.env.RDS_HOSTNAME', process.env.RDS_HOSTNAME)
// console.log('process.env.RDS_PORT', process.env.RDS_PORT)

app.use(cors({ credentials: true, origin }))
// set limits, https://stackoverflow.com/a/19965089/3171685
app.use(bodyParser.urlencoded({ extended: false, limit: '80mb' }))
app.use(bodyParser.json({ limit: '80mb' }))
app.use(express.json())
app.use(express.static('assets'))

// fetching pop-w
app.use(express.static(path.join(__dirname, '/dist')))
// app.get('/download', (req, res) => {
//   res.redirect('https://api.izoukhai.com/qr-codes/0e505664-ef6e-4e88-a5b6-c9145cf2fa4d')
// })
// app.get('/android', (req, res) => {
//   res.redirect('https://play.google.com/store/apps/details?id=com.jsindos.popf')
// })
// app.get('/@:username', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
// })
// app.get('/v/*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
// })
// app.get('/forgot-password/*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
// })
// app.get('/register-user/*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
// })

morgan.token('body', (req, res) => {
  if (req.originalUrl === '/graphql') {
    if (req.body?.operationName) return req.body?.operationName
    // weird logic to get printing of mutations working
    if (!req.body.query) return JSON.stringify(req.body)
    const query = req.body.query.split(' ')
    return JSON.stringify({ ...req.body, query: query[0] + ' ' + query[3] })
  }
  // truncate each value in body, if more than 50 characters
  return JSON.stringify(Object.entries(req.body).reduce((a, [k, v]) => ({ ...a, [k]: v.length > 50 ? v.replace(/(.{50})..+/, '$1…') : v }), {}))
})

const morganHandler = morgan(':method :url :status :body :response-time ms - :req[content-length] ')

// const domainNames = getDomainNames()

app.use(function (req, res, next) {
  if (['graphql'].some(e => req.url.includes(e)) && (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'production')
  ) {
    return morganHandler(req, res, next)
  } else {
    next()
  }
})

const sessionHandler = session({
  genid: (req) => uuid(),
  store: sequelizeSessionStore,
  secret: process.env.SECRET ? process.env.SECRET : 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
})

app.use(function (req, res, next) {
  // disable sessions
  if (req.url !== '/' && req.url !== '/252d1df388d847cfb5f6875e6f30e8c7') {
    return sessionHandler(req, res, next)
  } else {
    next()
  }
})

// router middleware must be after passport middleware
// https://stackoverflow.com/questions/16781294/passport-js-passport-initialize-middleware-not-in-use
// app.use(passport.initialize())
// app.use(passport.session())
app.use(router)

// simulated delay
// app.use((req, res, next) => process.env.NODE_ENV === 'development' ? setTimeout(next, 1000) : next())

sequelizeSessionStore.sync()

const hostname = '0.0.0.0'
const port = process.env.PORT || 8080

// `/graphql` is overloaded here, and below for the ApolloServer
app.use('/graphql', graphqlUploadExpress())

async function serve () {
  const server = new ApolloServer({
    schema,
    // always create a new Loader per request, otherwise the cache will build up over the lifetime of the deployed server
    context: ({ req, res, next }) => ({ services: db.services, models: db.models, req, sequelize: db.sequelize, logging: db.logging, res }),
    plugins: [
      // https://www.apollographql.com/docs/apollo-server/testing/build-run-queries/#graphql-playground
      ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'schema.polling.enable': false } })
    ],
    formatError: (e) => {
      console.error(JSON.stringify(e, null, 2))
      return e
    }
  })
  await server.start()

  // https://stackoverflow.com/questions/54485239/apollo-server-express-cors-issue
  server.applyMiddleware({
    app,
    cors: { credentials: true, origin },
    path: '/graphql'
  })

  await new Promise(resolve => app.listen(port, hostname, resolve))
  console.log(`Server running at http://${hostname}:${port}/`)
  console.log(`graphql running at http://${hostname}:${port}${server.graphqlPath}`)
}

serve()
