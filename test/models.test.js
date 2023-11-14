/* global describe, beforeEach, afterAll, it, expect */

const db = require('../src/server/db')
const seed = require('../src/server/seed')

describe('', () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true })
    await seed(db)
  }, 10000)

  afterAll(async () => {
    await db.sequelize.close()
  })

  // look at `seed.js` for data
  it('correctly establishes all relations', async () => {
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
})
