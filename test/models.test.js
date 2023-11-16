/* global describe, beforeEach, afterAll, it, expect */

const { mutations } = require('../src/server/schema')
const db = require('../src/server/db')
const seed = require('../src/server/seed')

describe('', () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true })
  }, 10000)

  afterAll(async () => {
    await db.sequelize.close()
  })

  // look at `seed.js` for data
  it('correctly establishes all relations', async () => {
    await seed(db)

    const customer = await db.models.Customers.findOne()
    expect(customer.name).toEqual('BAE')

    const workInstructions = await customer.getWorkInstructions()
    expect(workInstructions.length).toEqual(1)

    let workInstruction

    workInstruction = workInstructions[0]

    const procedures = await workInstruction.getProcedures()
    expect(procedures.length).toEqual(3)

    const procedure = procedures[0]
    // access the through table
    expect(procedure.workInstructionsProcedures.procedureIndex).toEqual(1)

    const steps = await procedure.getSteps()
    expect(steps.length).toEqual(3)

    const step = steps[0]

    // const images = await step.getImages()

    const childSteps = await step.getChildSteps()
    expect(childSteps.length).toEqual(2)

    // warnings
    const customerWarnings = await customer.getWarnings()
    expect(customerWarnings.length).toEqual(14)
    const workInstructionWarnings = await workInstruction.getWarnings()
    expect(workInstructionWarnings.length).toEqual(14)
    const stepWarnings = await step.getWarnings()
    expect(stepWarnings.length).toEqual(1)

    // equipment
    // const equipment = await workInstruction.getEquipment()

    // when including CMC, must include it by its 'as' alias
    workInstruction = await db.models.WorkInstructions.findByPk(workInstruction.id, {
      // include: db.models.CMCs
      include: [{ model: db.models.CMCs, as: 'CMC' }]
    })

    expect(workInstruction.CMC).not.toBeUndefined()

    const equipment = await db.models.Equipment.findOne()
    await equipment.getIsolations()
    // console.log(equipment)

    // expect(customerWarnings[0].id).toEqual(workInstructionWarnings[0].id)
    // expect(workInstructionWarnings[0].id).toEqual(stepWarnings[0].id)
  })

  it.only('when duplicating a procedure, also duplicate Steps, Images and Inspections', async () => {
    // also duplicate Steps, and Images and Inspections on those Steps
    // when duplicating Steps, re-assign the same Warnings applied to the old Steps

    const workInstruction = await db.models.WorkInstructions.create()
    const procedure = await db.models.Procedures.create({ title: 'title' })
    await procedure.addWorkInstruction(workInstruction)

    const warning = await db.models.Warnings.create({ type: 'diving' })
    const inspection = await db.models.Inspections.create({ activity: 'activity' })
    const image = await db.models.Images.create()

    const step = await db.models.Steps.create({ title: 'step1' })
    await step.setProcedure(procedure)
    await step.addWarning(warning)
    await step.addInspection(inspection)
    step.addImage(image)

    const step2 = await db.models.Steps.create({ title: 'step2' })
    await step2.setProcedure(procedure)

    // procedureId, workInstructionId, isDuplicating
    await mutations.Mutation.assignProcedureToWorkInstruction({}, { procedureId: procedure.id, workInstructionId: workInstruction.id, isDuplicating: true }, { ...db })

    const steps = await db.models.Steps.findAll()
    const warnings = await db.models.Warnings.findAll()
    const inspections = await db.models.Inspections.findAll()
    const images = await db.models.Images.findAll()

    expect(steps.length).toEqual(4)
    expect(warnings.length).toEqual(1)
    expect(inspections.length).toEqual(2)
    expect(images.length).toEqual(2)
  })
})
