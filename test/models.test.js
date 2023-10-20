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

    const workInstruction = workInstructions[0]

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
    expect(childSteps.length).toEqual(1)

    // warnings
    const customerWarnings = await customer.getWarnings()
    expect(customerWarnings.length).toEqual(14)
    const workInstructionWarnings = await workInstruction.getWarnings()
    expect(workInstructionWarnings.length).toEqual(14)
    const stepWarnings = await step.getWarnings()
    expect(stepWarnings.length).toEqual(1)

    // expect(customerWarnings[0].id).toEqual(workInstructionWarnings[0].id)
    // expect(workInstructionWarnings[0].id).toEqual(stepWarnings[0].id)
  })
})
