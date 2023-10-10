const fs = require('fs')
const path = require('path')
const router = require('express').Router()

const db = require('./models.js')

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') === -1) && (file !== 'db') && (file !== 'models')
  })
  .forEach(directory => {
    fs
      .readdirSync(path.join(__dirname, directory))
      .filter(file => {
        return file.slice(-9) === 'routes.js'
      })
      .forEach(file => {
        const routes = require(path.join(__dirname, directory, file))
        router.use(`/${file.slice(0, -10)}`, routes)
      })
  })

router.get('/', (req, res) => {
  return res.send('OK!')
})

module.exports = router
