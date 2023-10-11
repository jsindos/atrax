const env = process.env.NODE_ENV || 'development'
const config = require('../../settings.json')[env]

module.exports = async (db) => {
  console.log('seeding database')

  const { models } = db
  const { Customers, WorkInstructions, Warnings, Procedures, Steps, ChildSteps } = models

  //
  /**
   * exactly this seeded data is used for `models.test.js`
   * if we wish to change it, first copy this data into that test
   */

  const customers = await Customers.bulkCreate([
    { name: 'BAE' },
    { name: 'ACSSPO' },
    { name: 'DDGSPO' },
    { name: 'Raytheon' },
  ])

  const customer = customers[0]

  const workInstruction = await WorkInstructions.create({
    customerId: customer.id,
    title: 'title',
    draftingOrganisation: 'draftingOrganisation',
    hoursToComplete: 'hoursToComplete',
    system: 'system',
    shipSystem: 'shipSystem',
    subsystem: 'subsystem',
    SYSCOM: 'SYSCOM',
    MIPSeries: 'MIPSeries',
    activityNumber: 'activityNumber',
  })

  /**
   * `type` is one of 'warning', 'caution', 'note'
   * `warningType` is an enum, unsure what the values are yet
   */
  const warning = await Warnings.create({
    type: 'warning',
    content: 'content',
    warningType: 'warningType',
  })
  await warning.addWorkInstruction(workInstruction)
  await warning.setCustomer(customer)

  const procedure = await Procedures.create({ title: 'title' })
  // add index to the through table
  await procedure.addWorkInstruction(workInstruction, { through: { procedureIndex: 1 } })

  const step = await Steps.create({
    title: 'title',
    images: `[${config.MEDIA_URL} + '/bee.png']`,
    index: 1,
  })
  await step.setProcedure(procedure)
  await step.addWarning(warning)

  const childStep = await ChildSteps.create({ title: 'title', index: 1 })
  await childStep.setStep(step)

  console.log('successfully seeded')
}
