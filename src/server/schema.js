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

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') === -1 && file !== 'db' && file !== 'models'
  })
  .forEach((directory) => {
    fs.readdirSync(path.join(__dirname, directory))
      .filter((file) => {
        return file.slice(-10) === 'graphql.js'
      })
      .forEach((file) => {
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
    workInstruction(id: Int!): WorkInstruction
    step(id: Int!): Step
    warnings: [Warning]
  }

  type Customer {
    id: Int
    name: String
    workInstructions: [WorkInstruction]
    warnings: [Warning]
  }

  type Warning {
    id: Int
    isDefault: Boolean
    type: String
    content: String
    warningType: String
    customer: Customer
    workInstructions: [WorkInstruction]
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
`

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    async customers(root, args, context) {
      return context.models.Customers.findAll()
    },
    async workInstructions(root, args, context) {
      return context.models.WorkInstructions.findAll()
    },
    async workInstruction(root, args, context) {
      return context.models.WorkInstructions.findByPk(args.id)
    },
    async step(root, args, context) {
      return context.models.Steps.findByPk(args.id)
    },
    async warnings(root, args, context) {
      return context.models.Warnings.findAll()
    },
  },
  Customer: {
    workInstructions: async (customer, args, context) => {
      return customer.getWorkInstructions()
    },
    warnings: async (customer, args, context) => {
      return customer.getWarnings()
    },
  },
  Warning: {
    customer: async (warning, args, context) => {
      return warning.getCustomer()
    },
    workInstructions: async (warning, args, context) => {
      return warning.getWorkInstructions()
    },
  },
  WorkInstruction: {
    procedures: async (workInstruction, args, context) => {
      const procedures = await workInstruction.getProcedures()
      procedures.forEach((p) =>
        p.setDataValue('index', p.workInstructionsProcedures.procedureIndex)
      )
      return procedures
    },
    warnings: async (workInstruction, args, context) => {
      return workInstruction.getWarnings()
    },
    customer: async (workInstruction, args, context) => {
      return workInstruction.getCustomer()
    },
  },
  WorkInstructionProcedure: {
    procedure: async (workInstructionProcedure, args, context) => {
      return workInstructionProcedure
    },
  },
  Procedure: {
    steps: async (procedure, args, context) => {
      return procedure.getSteps()
    },
  },
  Step: {
    childSteps: async (step, args, context) => {
      return step.getChildSteps()
    },
    warnings: async (step, args, context) => {
      return step.getWarnings()
    },
  },
}

const Mutation = `
  type Mutation {
    _empty: String
    saveWorkInstruction(workInstruction: WorkInstructionInput!): WorkInstruction
    saveChildStep(childStep: ChildStepInput!): ChildStep
    saveStep(step: StepInput!): Step
    createWorkInstruction(workInstruction: WorkInstructionInput!): Customer
    deleteWorkInstruction(id: ID!): Customer
    duplicateWorkInstruction(existingWorkInstructionId: ID!, customerId: ID!, newActivityNumber: String!): Customer
  }

  input WorkInstructionInput {
    id: Int
    
    title: String
    draftingOrganisation: String
    hoursToComplete: String
    customerId: Int

    system: String
    shipSystem: String
    subsystem: String
    SYSCOM: String
    MIPSeries: String
    activityNumber: String
  }

  input StepInput {
    id: Int
    title: String
  }

  input ChildStepInput {
    id: Int
    title: String
    index: Int
  }
`

const mutations = {
  Mutation: {
    async createWorkInstruction(root, args, context) {
      const { workInstruction: workInstructionFields } = args

      await context.models.WorkInstructions.create(workInstructionFields)

      const customer = await context.models.Customers.findByPk(workInstructionFields.customerId)

      return customer
    },
    async saveWorkInstruction(root, args, context) {
      const { workInstruction: workInstructionFields } = args

      // https://stackoverflow.com/a/40543424/3171685
      // eslint-disable-next-line no-unused-vars
      const [number, updatedRows] = await context.models.WorkInstructions.update(
        workInstructionFields,
        { where: { id: workInstructionFields.id }, returning: true }
      )
      const workInstruction = updatedRows[0]

      return workInstruction
    },
    async deleteWorkInstruction(root, args, context) {
      const { id } = args

      const workInstruction = await context.models.WorkInstructions.findByPk(id)

      if (!workInstruction) {
        throw new Error('WorkInstruction not found')
      }

      await context.models.WorkInstructions.destroy({
        where: { id },
      })

      const customer = await context.models.Customers.findByPk(workInstruction.customerId)

      return customer
    },

    async duplicateWorkInstruction(root, args, context) {
      const { existingWorkInstructionId, customerId, newActivityNumber } = args

      // Find the existing work instruction
      const existingWorkInstruction = await context.models.WorkInstructions.findByPk(
        existingWorkInstructionId
      )

      if (!existingWorkInstruction) {
        throw new Error(`WorkInstruction with id ${existingWorkInstructionId} not found`)
      }

      // Create a new work instruction based on the existing one
      const newWorkInstructionFields = {
        ...existingWorkInstruction.dataValues,
        customerId: customerId,
        activityNumber: newActivityNumber,
      }

      // Delete the id field to ensure a new id is generated
      delete newWorkInstructionFields.id

      // Create the new work instruction
      await context.models.WorkInstructions.create(newWorkInstructionFields)

      // Return the customer associated with the new work instruction
      const customer = await context.models.Customers.findByPk(customerId)

      return customer
    },

    async saveStep(root, args, context) {
      const { step: stepFields } = args

      // https://stackoverflow.com/a/40543424/3171685
      // eslint-disable-next-line no-unused-vars
      const [number, updatedRows] = await context.models.Steps.update(stepFields, {
        where: { id: stepFields.id },
        returning: true,
      })
      const step = updatedRows[0]

      return step
    },
    async saveChildStep(root, args, context) {
      const { childStep: childStepFields } = args

      // https://stackoverflow.com/a/40543424/3171685
      // eslint-disable-next-line no-unused-vars
      const [number, updatedRows] = await context.models.ChildSteps.update(childStepFields, {
        where: { id: childStepFields.id },
        returning: true,
      })
      const childStep = updatedRows[0]

      return childStep
    },
  },
}

module.exports = makeExecutableSchema({
  typeDefs: [
    Query,
    Mutation,
    ...Object.values(schemaParts).map(({ typeDef }) => transpileSchema(typeDef)),
  ],
  resolvers: merge(
    resolvers,
    mutations,
    ...Object.values(schemaParts).map(({ resolvers }) => resolvers)
  ),
})
