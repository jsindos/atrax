module.exports = async (db) => {
  console.log('seeding database')

  const { models } = db
  const { Customers, WorkInstructions, Warnings, Procedures, Steps } = models

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
   * `warningType` is one of 'warning', 'caution', 'note'
   * `type` is an enum, of values 'general', 'electrical', 'mechanical', 'tagout', 'diving' and 'hydraulic'
   */
  const warningsData = [
    { type: 'diving', warningType: 'warning', content: 'Divers are not to approach main inlets when in use.', customerId: 3 },
    { type: 'diving', warningType: 'warning', content: 'An attended diver is never to cross the keel. If a job has to be done on the opposite side of the ship they are to be called up to the surface and sent down again on the other side.', customerId: 3, isDefault: true },
    { type: 'diving', warningType: 'warning', content: 'The diver is not to pass between the shaft and the hull or the “A” bracket in the case the lifeline becomes fouled, unless a special underwater attendant is available on the job to attend the diver.', customerId: 3, isDefault: true },
    { type: 'diving', warningType: 'warning', content: 'The Ship will pass the following message over the Ship\'s 1MC every 20 minutes: “Restrictions in force, diving operations in progress, do not operate any underwater equipment without giving prior notification to the Engineer Officer of the day and the Diving Supervisor”.', customerId: 3, isDefault: true },
    { type: 'diving', warningType: 'warning', content: 'Rotation of propellers or operation of underwater electrical equipment while divers are in the vicinity can cause serious injury or death. Ensure that the local and remote Bow Thruster motor controls are de-energised and tagged out and shaft brakes engaged prior to beginning underwater operations.', customerId: 3, isDefault: true },
    { type: 'diving', warningType: 'warning', content: 'Bow Thruster shall not be actuated (raised or lowered) while diver is working overside in the water.', customerId: 3, isDefault: true },
    { type: 'general', warningType: 'warning', content: 'Ensure all Tag-Out procedures are in accordance with Class Standing Orders Volume 1 Chapter 7 W- Whole Ships Maintenance Management.', customerId: 3, isDefault: true },
    { type: 'general', warningType: 'caution', content: 'Geometry of propeller blade leading edges, trailing edges and tips is critical. Extreme care must be taken when cleaning outer four inch periphery of each blade.', customerId: 3 },
    { type: 'painting', warningType: 'caution', content: 'Special care should be exercised to avoid gouging protective coating (resin - impregnated fibrous glass cloth or rubber) under antifouling paint on shaft.', customerId: 3 },
    { type: 'general', warningType: 'note', content: 'Accomplish this maintenance requirement when any of the following situations or periodicities occur: a. Six Monthly, b. When abnormal noises or vibrations are detected, or when the propeller has been operating in dock for prolonged periods of time in excess of those periods normally used for docking and casting off manoeuvers, whichever comes first.', customerId: 3 },
    { type: 'diving', warningType: 'note', content: 'Clearance to dive form, found on NAVY MCDGRP website, must be completed before commencement of diving operations', customerId: 3, isDefault: true },
    { type: 'diving', warningType: 'note', content: 'All diving operations are to be under the direct charge of a diving supervisor.', customerId: 3, isDefault: true },
    { type: 'electrical', warningType: 'note', content: 'Electrical isolations shall be conducted IAW Class Standing Orders following the table below.', customerId: 3, isDefault: true },
    { type: 'mechanical', warningType: 'note', content: 'Mechanical isolations shall be conducted IAW Class Standing Orders following the table below.', customerId: 3, isDefault: true }
  ]

  let warning

  for (const warningData of warningsData) {
    warning = await Warnings.create(warningData)
    await warning.addWorkInstruction(workInstruction)
    await warning.setCustomer(customer)
  }

  const procedure = await Procedures.create({ title: 'title' })
  // add index to the through table
  await procedure.addWorkInstruction(workInstruction, { through: { procedureIndex: 1 } })

  const procedure2 = await Procedures.create({ title: 'title2' })
  // add index to the through table
  await procedure2.addWorkInstruction(workInstruction, { through: { procedureIndex: 2 } })

  const procedure3 = await Procedures.create({ title: 'title3' })
  // add index to the through table
  await procedure3.addWorkInstruction(workInstruction, { through: { procedureIndex: 3 } })

  // `[${config.MEDIA_URL} + '/bee.png']`
  // const image = await Images.create()

  const step = await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  })
  await step.setProcedure(procedure)
  await step.addWarning(warning)

  const step2 = await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  })
  await step2.setProcedure(procedure)
  await step2.addWarning(warning)
  await step2.setParent(step)

  const step3 = await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  })
  await step3.setProcedure(procedure)
  await step3.addWarning(warning)
  await step3.setParent(step2)

  // another step
  await Steps.create({
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  })

  console.log('successfully seeded')
}
