// https://www.apollographql.com/blog/backend/schema-design/modularizing-your-graphql-schema-code/

const fs = require('fs')
const path = require('path')
const { transpileSchema } = require('graphql-s2s').graphqls2s
const { makeExecutableSchema } = require('graphql-tools')
const { merge } = require('lodash')
const { GraphQLUpload } = require('graphql-upload')

// const { AuthenticationError } = require('apollo-server-express')
// const { Op } = require('sequelize')

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
    workInstructions: [WorkInstruction]
  }

  type Customer {
    id: Int
    name: String
    workInstructions: [WorkInstruction]
    warnings: [Warning]
  }

  type WorkInstruction {
    id: Int
    title: String
    draftingOrganisation: String
    hoursToComplete: String
    system: String
    shipSystem: String
    subsystem: String
    SYSCOM: String
    MIPSeries: String
    activityNumber: String
    customer: Customer
    procedures: [WorkInstructionProcedure]
    warnings: [Warning]
  }

  # used to associate an index for a procedure in a particular work instruction
  type WorkInstructionProcedure {
    id: Int
    index: Int
    procedure: Procedure
  }

  type Procedure {
    id: Int
    title: String
    steps: [Step]
  }

  type Step {
    id: Int
    title: String
    images: String
    index: Int
    childSteps: [ChildStep]
    warnings: [Warning]
  }

  type ChildStep {
    id: Int
    title: String
    index: Int
  }

  type Warning {
    id: Int
    type: String
    content: String
    warningType: String
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
    },
    async workInstructions (root, args, context) {
      return context.models.WorkInstructions.findAll()
    }
  },
  Customer: {
    workInstructions: async (customer, args, context) => {
      return customer.getWorkInstructions()
    },
    warnings: async (customer, args, context) => {
      return customer.getWarnings()
    }
  },
  WorkInstruction: {
    procedures: async (workInstruction, args, context) => {
      const procedures = await workInstruction.getProcedures()
      procedures.forEach(p => p.setDataValue('index', p.workInstructionsProcedures.procedureIndex))
      return procedures
    },
    warnings: async (workInstruction, args, context) => {
      return workInstruction.getWarnings()
    },
    customer: async (workInstruction, args, context) => {
      return workInstruction.getCustomer()
    }
  },
  WorkInstructionProcedure: {
    procedure: async (workInstructionProcedure, args, context) => {
      return workInstructionProcedure
    }
  },
  Procedure: {
    steps: async (procedure, args, context) => {
      return procedure.getSteps()
    }
  },
  Step: {
    childSteps: async (step, args, context) => {
      return step.getChildSteps()
    },
    warnings: async (step, args, context) => {
      return step.getWarnings()
    }
  },
  Mutation: {}
}

module.exports = makeExecutableSchema({
  typeDefs: [Query, ...Object.values(schemaParts).map(({ typeDef }) => transpileSchema(typeDef))],
  resolvers: merge(resolvers, ...Object.values(schemaParts).map(({ resolvers }) => resolvers))
})
