const env = process.env.NODE_ENV || 'development'
const config = require('../../settings.json')[env]

module.exports = async (db) => {
  console.log('seeding database')

  const { models } = db
  const { Customers, WorkInstructions, Warnings, Procedures, Steps, ChildSteps } = models

  let customers
  customers = await Customers.findAll()

  if (customers.length > 0) {
    console.log('already seeded')
    return
  }

  //
  /**
   * exactly this seeded data is used for `models.test.js`
   * if we wish to change it, first copy this data into that test
   */

  customers = await Customers.bulkCreate([
    { name: 'BAE' },
    { name: 'ACSSPO' },
    { name: 'DDGSPO' },
    { name: 'Raytheon' }
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
    activityNumber: 'activityNumber'
  })

  /**
   * `type` is one of 'warning', 'caution', 'note'
   * `warningType` is an enum, unsure what the values are yet
   */
  const warning = await Warnings.create({
    type: 'warning',
    content: 'content',
    warningType: 'warningType'
  })
  await Warnings.create({
    type: 'warning',
    content: 'content2',
    warningType: 'warningType'
  })
  await Warnings.create({
    type: 'caution',
    content: 'content2',
    warningType: 'warningType'
  })
  await Warnings.create({
    type: 'note',
    content: 'content2',
    warningType: 'warningType'
  })
  await warning.addWorkInstruction(workInstruction)
  await warning.setCustomer(customer)

  const procedure = await Procedures.create({ title: 'title' })
  // add index to the through table
  await procedure.addWorkInstruction(workInstruction, { through: { procedureIndex: 1 } })

  const procedure2 = await Procedures.create({ title: 'title2' })
  // add index to the through table
  await procedure2.addWorkInstruction(workInstruction, { through: { procedureIndex: 2 } })

  const procedure3 = await Procedures.create({ title: 'title3' })
  // add index to the through table
  await procedure3.addWorkInstruction(workInstruction, { through: { procedureIndex: 3 } })

  const step = await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    images: `[${config.MEDIA_URL} + '/bee.png']`,
    index: 1
  })
  await step.setProcedure(procedure)
  await step.addWarning(warning)

  const step2 = await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    images: `[${config.MEDIA_URL} + '/bee.png']`,
    index: 1
  })
  await step2.setProcedure(procedure)
  await step2.addWarning(warning)

  const step3 = await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    images: `[${config.MEDIA_URL} + '/bee.png']`,
    index: 1
  })
  await step3.setProcedure(procedure)
  await step3.addWarning(warning)

  const childStep = await ChildSteps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    index: 1
  })
  await childStep.setStep(step)

  console.log('successfully seeded')
}
