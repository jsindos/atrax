// https://www.apollographql.com/blog/backend/schema-design/modularizing-your-graphql-schema-code/

const fs = require('fs')
const path = require('path')
const { transpileSchema } = require('graphql-s2s').graphqls2s
const { makeExecutableSchema } = require('graphql-tools')
const { merge } = require('lodash')
const { GraphQLUpload } = require('graphql-upload')

const { AuthenticationError } = require('apollo-server-express')
const { Op } = require('sequelize')

const schemaParts = {}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') === -1) && (file !== 'db') && (file !== 'models')
  })
  .forEach(directory => {
    fs
      .readdirSync(path.join(__dirname, directory))
      .filter(file => {
        return file.slice(-10) === 'graphql.js'
      })
      .forEach(file => {
        const { typeDef, resolvers } = require(path.join(__dirname, directory, file))
        schemaParts[file.slice(0, -11)] = { typeDef, resolvers }
      })
  })

const Query = `
  scalar Upload

  type Query {
    _empty: String
    customers: [Customer]
  }

  type Customer {
    id: Int
    name: String
    workInstructions: [WorkInstruction]
  }

  type WorkInstruction {
    id: Int
    title: String
  }


  type Mutation {
    _empty: String
  }
`

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    async customers (root, args, context) {
      return context.models.Customers.findAll()
    }
  },
  Mutation: {}
}

module.exports = makeExecutableSchema({
  typeDefs: [Query, ...Object.values(schemaParts).map(({ typeDef }) => transpileSchema(typeDef))],
  resolvers: merge(resolvers, ...Object.values(schemaParts).map(({ resolvers }) => resolvers))
})
