'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const seed = require('./seed')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
let config = require(path.join(__dirname, '/../../settings.json'))[env]

config = Object.entries(config)
  .map(([k, v]) => (String(v).includes('process') ? { [k]: eval(v) } : { [k]: v })) // eslint-disable-line no-eval
  .reduce((a, c) => ({ ...a, ...c }), {})

// const { populateDatabase, seedMakerEarnings, seedOrders, USER_ID } = require('../db/seed/seed.js')
// const createMaterializedViews = require('../db/seed/createMaterializedViews')

let sequelize
if (process.env.USE_CONNECTION_STRING) {
  sequelize = new Sequelize('ebdb', 'pop', 'E4Q7ufuAdhm!fhb', {
    host: 'aaeuktxcxfukq6.cpq4oq6xi1l9.ap-southeast-2.rds.amazonaws.com',
    dialect: 'postgres'
  })
} else if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  let count = 0
  sequelize = new Sequelize(config.database, config.username, config.password, {
    logging: (msg) => {
      // https://sequelize.org/docs/v6/getting-started/#logging
      // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
      console.log(msg.replace('Executing (default)', `\x1b[40m\x1b[37mExecuting ${count}\x1b[0m`))
      count++
    },
    ...config
  })
}

const db = {
  models: {},
  services: {},
  sequelize,
  Sequelize,
  initialize
}

process.env.NODE_ENV === 'production' &&
  db.sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.')
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err)
    })

// models
fs.readdirSync(path.join(__dirname, 'models'))
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  })
  .forEach((file) => {
    const models = require(path.join(__dirname, 'models', file))(db, Sequelize.DataTypes)
    models.forEach((model) => (db.models[model.modelName] = model))
  })

Object.keys(db.models).forEach((modelName) => {
  if (db.models[modelName].associate) {
    db.models[modelName].associate(db.models)
  }
})

// services
fs.readdirSync(path.join(__dirname, '..'))
  .filter((file) => {
    return file.indexOf('.') === -1 && file !== 'db' && file !== 'models'
  })
  .forEach((directory) => {
    fs.readdirSync(path.join(__dirname, '..', directory))
      .filter((file) => {
        return file.slice(-10) === 'service.js'
      })
      .forEach((file) => {
        const Class = require(path.join(__dirname, '..', directory, file))
        db.services[Class.name] = new Class(db)
      })
  })

async function initialize () {
  if (process.env.NODE_ENV === 'development') {
    await db.sequelize.sync({
      // force: true,
    })
    await seed(db)
  }
}

initialize()

module.exports = db
