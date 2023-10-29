// https://www.apollographql.com/blog/backend/schema-design/modularizing-your-graphql-schema-code/

const fs = require('fs')
const path = require('path')
const { transpileSchema } = require('graphql-s2s').graphqls2s
const { makeExecutableSchema } = require('graphql-tools')
const { merge } = require('lodash')
const { GraphQLUpload } = require('graphql-upload')

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
    equipment: [Equipment]
    steps: [Step]
    warnings: [Warning]
    procedures: [Procedure]
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

  type Equipment {
    id: Int
    name: String
    MELCode: String
    CMC: CMC
  }

  type CMC {
    id: Int
    code: String
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

    equipment: [Equipment]
    customer: Customer
    CMC: CMC
    procedures: [WorkInstructionProcedure]
    warnings: [Warning]
  }

  # used to associate an index for a procedure in a particular work instruction
  type WorkInstructionProcedure {
    id: Int
    index: Int
    procedure: Procedure
    workInstruction: WorkInstruction
  }

  type Procedure {
    id: Int
    title: String
    steps: [Step]
    index: Int
    workInstructions: [WorkInstruction]
  }

  type Step {
    id: Int
    title: String
    parentId: Int
    index: Int
    images: [Image]
    warnings: [Warning]
  }

  type Image {
    id: Int
    uri: String
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
      return context.models.Warnings.findAll({ order: [['id', 'ASC']] })
    },
    async procedures(root, args, context) {
      return context.models.Procedures.findAll()
    },
    async steps(root, args, context) {
      return context.models.Steps.findAll()
    },
    async equipment(root, args, context) {
      return context.models.Equipment.findAll()
    },
  },
  Equipment: {
    CMC: async (equipment, args, context) => {
      return equipment.getCMC()
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
    CMC: async (workInstruction, args, context) => {
      return workInstruction.getCMC()
    },
    equipment: async (workInstruction, args, context) => {
      return workInstruction.getEquipment()
    },
  },
  WorkInstructionProcedure: {
    procedure: async (workInstructionProcedure, args, context) => {
      return workInstructionProcedure
    },
    workInstruction: async (workInstructionProcedure, args, context) => {
      return workInstructionProcedure.getWorkInstruction()
    },
  },
  Procedure: {
    steps: async (procedure, args, context) => {
      return procedure.getSteps()
    },
    workInstructions: async (procedure, args, context) => {
      return procedure.getWorkInstructions()
    },
  },
  Step: {
    images: async (step, args, context) => {
      return step.getImages()
    },
    warnings: async (step, args, context) => {
      return step.getWarnings()
    },
  },
}

const Mutation = `
  type Mutation {
    _empty: String

    createWorkInstruction(workInstruction: WorkInstructionInput!): Customer
    saveWorkInstruction(workInstruction: WorkInstructionInput!): WorkInstruction
    deleteWorkInstruction(id: ID!): Customer
    duplicateWorkInstruction(existingWorkInstructionId: ID!, customerId: ID!, newActivityNumber: String!): Customer
    assignProcedureToWorkInstruction(procedureId: ID!, workInstructionId: ID!, isDuplicating: Boolean): WorkInstruction

    createProcedure(procedure: ProcedureInput!): WorkInstruction
    updateProcedureIndices(procedures: [ProcedureInput!]!, workInstructionId: ID!): WorkInstruction
    deleteProcedure(id: ID!): WorkInstruction

    saveStep(step: StepInput!): Step
    createStep(step: StepInput!): Procedure 
    updateStepIndices(steps: [StepInput!]): [Step]
    deleteStep(id: ID!): Procedure
    createStepImage(stepId: ID!, image: Upload): Step
    deleteStepImage(imageId: ID!): Step

    saveWarning(warning: WarningInput!): Warning
    createWarning(warning : WarningInput!): Warning

    createEquipment(equipment: EquipmentInput!, workInstructionId: Int!): WorkInstruction
    saveEquipment(equipment: EquipmentInput!): WorkInstruction
  }

  input EquipmentInput {
    id: Int
    MELCode: String
    name: String
  }

  input WarningInput {
    id: Int
    isDefault: Boolean
    type: String
    content: String
    warningType: String
    customerId: Int
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

    CMC: String

    procedures: [ProcedureInput]
    warningIds: [Int]
    equipmentIds: [Int]
  }

  input ProcedureInput {
    id: Int
    workInstructionId: Int
    title: String
    type: String
    steps: [StepInput]
    index: Int
  }

  input StepInput {
    id: Int
    procedureId: Int
    title: String
    parentId: Int
    index: Int
    warningIds: [Int]
  }
`

const mutations = {
  Mutation: {
    async createEquipment(root, args, context) {
      const { equipment: equipmentFields, workInstructionId } = args

      const workInstruction = await context.models.WorkInstructions.findByPk(workInstructionId, {
        include: [{ model: context.models.CMCs, as: 'CMC' }],
      })

      const equipment = await context.models.Equipment.create(equipmentFields)
      await equipment.setCMC(workInstruction.CMC)

      // Refetch the work instruction to get the updated data
      const updatedWorkInstruction = await context.models.WorkInstructions.findByPk(
        workInstructionId,
        {
          include: [
            { model: context.models.CMCs, as: 'CMC' },
            { model: context.models.Equipment }, // Include Equipment in the fetched data
          ],
        }
      )

      return updatedWorkInstruction
    },
    async saveEquipment(root, args, context) {
      const { equipment: equipmentFields } = args

      const [number, updatedRows] = await context.models.Equipment.update(equipmentFields, {
        where: { id: equipmentFields.id },
        returning: true,
      })
      const equipment = updatedRows[0]

      // Refetch the work instruction to get the updated data
      const updatedWorkInstruction = await context.models.WorkInstructions.findByPk(
        equipment.workInstructionId,
        {
          include: [
            { model: context.models.CMCs, as: 'CMC' },
            { model: context.models.Equipment }, // Include Equipment in the fetched data
          ],
        }
      )

      return updatedWorkInstruction
    },
    async createStepImage(root, args, context) {
      const { stepId, image } = args

      // https://github.com/jaydenseric/apollo-upload-examples/blob/master/api/schema/MutationType.mjs
      const { uri } = await context.services.ImageUploadService.storeImage(
        image,
        context.req.headers.host
      )

      const step = await context.models.Steps.findByPk(stepId)

      if (uri) {
        const currentImages = await context.models.Images.findAll({
          where: { stepId },
          order: [['index', 'DESC']],
        })
        const image = await context.models.Images.create({
          uri,
          index: currentImages.length ? currentImages[0].index + 1 : 1,
        })
        await step.addImage(image)
      }

      return step
    },
    async deleteStepImage(root, { imageId }, context) {
      const image = await context.models.Images.findByPk(imageId)

      if (!image) return

      const step = await image.getStep()

      await image.destroy()

      return step
    },
    async createWarning(root, args, context) {
      const { warning: warningFields } = args

      const warning = await context.models.Warnings.create(warningFields)

      return warning
    },
    async createWorkInstruction(root, args, context) {
      const { workInstruction: workInstructionFields } = args

      const workInstruction = await context.models.WorkInstructions.create(workInstructionFields)

      const customer = await context.models.Customers.findByPk(workInstructionFields.customerId)

      const warnings = await customer.getWarnings({ where: { isDefault: true } })

      await workInstruction.addWarnings(warnings)

      return customer
    },
    async saveWarning(root, args, context) {
      const { warning: warningFields } = args

      // https://stackoverflow.com/a/40543424/3171685
      // eslint-disable-next-line no-unused-vars
      const [number, updatedRows] = await context.models.Warnings.update(warningFields, {
        where: { id: warningFields.id },
        returning: true,
      })
      const warning = updatedRows[0]

      return warning
    },
    async saveWorkInstruction(root, args, context) {
      const {
        workInstruction: { warningIds, equipmentIds, CMC, ...workInstructionFields },
      } = args

      // https://stackoverflow.com/a/40543424/3171685
      // eslint-disable-next-line no-unused-vars
      const [number, updatedRows] = await context.models.WorkInstructions.update(
        workInstructionFields,
        { where: { id: workInstructionFields.id }, returning: true }
      )
      const workInstruction = updatedRows[0]

      if (CMC) {
        const cmc = await context.models.CMCs.findOne({ where: { code: CMC } })
        if (cmc) {
          await workInstruction.setCMC(cmc)
        }
      }

      if (warningIds) {
        await context.models.WorkInstructionsWarnings.destroy({
          where: { workInstructionId: workInstruction.id },
        })
        await workInstruction.addWarnings(warningIds)
      }

      if (equipmentIds) {
        await context.models.WorkInstructionsEquipments.destroy({
          where: { workInstructionId: workInstruction.id },
        })
        await workInstruction.addEquipment(equipmentIds)
      }

      return workInstruction
    },
    async saveStep(root, args, context) {
      const {
        step: { warningIds, ...stepFields },
      } = args

      // https://stackoverflow.com/a/40543424/3171685
      // eslint-disable-next-line no-unused-vars
      const [number, updatedRows] = await context.models.Steps.update(stepFields, {
        where: { id: stepFields.id },
        returning: true,
      })
      const step = updatedRows[0]

      if (warningIds) {
        await context.models.StepsWarnings.destroy({
          where: { stepId: step.id },
        })
        await step.addWarnings(warningIds)
      }

      return step
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
      const existingWorkInstruction =
        await context.models.WorkInstructions.findByPk(existingWorkInstructionId)

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

    async assignProcedureToWorkInstruction(root, args, context) {
      const { procedureId, workInstructionId, isDuplicating } = args

      // Find the procedure
      const procedure = await context.models.Procedures.findByPk(procedureId)

      // Find the work instruction
      const workInstruction = await context.models.WorkInstructions.findByPk(workInstructionId)
      const procedures = await workInstruction.getProcedures()

      // Calculate the index for the new procedure
      const index = procedures.length + 1

      if (isDuplicating) {
        const newProcedureData = Object.entries(procedure.dataValues)
          .filter(([key]) => key !== 'id')
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        const newProcedure = await context.models.Procedures.create(newProcedureData)
        await newProcedure.addWorkInstruction(workInstruction, {
          through: { procedureIndex: index },
        })
      } else {
        await procedure.addWorkInstruction(workInstruction, { through: { procedureIndex: index } })
      }

      // Return the new WorkInstructionProcedure
      return workInstruction
    },

    // All that needs to pass into this thing is workinstruction.id
    async createProcedure(root, args, context) {
      const { procedure: procedureFields } = args

      // Create the new procedure
      const newProcedure = await context.models.Procedures.create(procedureFields)

      // Find the work instruction
      const workInstruction = await context.models.WorkInstructions.findByPk(
        procedureFields.workInstructionId
      )

      // Associate the procedure with the work instruction
      if (workInstruction) {
        await workInstruction.addProcedure(newProcedure)
      }

      // Fetch the updated work instruction with all associated procedures.
      const updatedWorkInstruction = await context.models.WorkInstructions.findByPk(
        procedureFields.workInstructionId,
        { include: context.models.Procedures }
      )

      // Return the updated work instruction.
      return updatedWorkInstruction
    },

    async deleteProcedure(root, args, context) {
      const { id } = args

      // Find the procedure
      const procedure = await context.models.Procedures.findByPk(id)

      if (!procedure) {
        throw new Error('Procedure not found')
      }

      // Delete the procedure
      await context.models.Procedures.destroy({
        where: { id },
      })

      // Fetch the updated work instruction with all associated procedures.
      const updatedWorkInstruction = await context.models.WorkInstructions.findByPk(
        procedure.workInstructionId,
        { include: context.models.Procedures }
      )

      // Return the updated work instruction.
      return updatedWorkInstruction
    },

    async createStep(root, args, context) {
      const { step: stepFields } = args

      // Find the procedure
      const procedure = await context.models.Procedures.findByPk(stepFields.procedureId, {
        include: context.models.Steps,
      })

      // Create the new step
      const newStep = await context.models.Steps.create({
        ...stepFields,
        index: procedure.steps.length,
      })

      // Associate the step with the procedure
      if (procedure) {
        await procedure.addStep(newStep)
      }

      // Fetch the updated procedure with all associated steps.
      const updatedProcedure = await context.models.Procedures.findByPk(stepFields.procedureId, {
        include: context.models.Steps,
      })

      // Return the updated procedure.
      return updatedProcedure
    },
    async deleteStep(root, args, context) {
      const { id } = args

      // Find the step
      const step = await context.models.Steps.findByPk(id)

      if (!step) {
        throw new Error('Step not found')
      }

      // Delete the step
      await context.models.Steps.destroy({
        where: { id },
      })

      // Fetch the updated procedure with all associated steps.
      const updatedProcedure = await context.models.Procedures.findByPk(step.procedureId, {
        include: context.models.Steps,
      })

      // Return the updated procedure.
      return updatedProcedure
    },

    async updateStepIndices(root, args, context) {
      const { steps } = args
      const updatedSteps = []

      // Update the index property of each step to match its position in the array
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]

        // https://stackoverflow.com/a/40543424/3171685
        // eslint-disable-next-line no-unused-vars
        const [number, updatedRows] = await context.models.Steps.update(step, {
          where: { id: step.id },
          returning: true,
        })
        const updatedStep = updatedRows[0]

        updatedSteps.push(updatedStep)
      }

      // Return the array of updated steps
      return updatedSteps
    },
    async updateProcedureIndices(root, args, context) {
      const { procedures, workInstructionId } = args

      const workInstruction = await context.models.WorkInstructions.findByPk(workInstructionId, {
        include: context.models.Procedures,
      })

      await Promise.all(
        workInstruction.procedures.map(async (p) => {
          const newIndex = procedures.findIndex((pp) => pp.id === p.id)
          await context.models.WorkInstructionsProcedures.update(
            { procedureIndex: newIndex },
            { where: { procedureId: p.id, workInstructionId } }
          )
        })
      )

      return workInstruction
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
