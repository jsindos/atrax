module.exports = async db => {
  console.log('seeding database')

  const { models, sequelize } = db
  const {
    Customers,
    WorkInstructions
  } = models

  const c = await Customers.create({ name: 'Garth' })
  const workInstruction = await WorkInstructions.create({ customerId: c.id, title: 'Enter the DFM Tanks and inspect for corrosion issues' })

  console.log('successfully seeded')
}