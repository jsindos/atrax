module.exports = async (db) => {
  console.log('seeding database')

  const { models, sequelize } = db
  const { Customers, WorkInstructions } = models

  const customers = await Customers.bulkCreate([
    { name: 'BAE' },
    { name: 'ACSSPO' },
    { name: 'DDGSPO' },
    { name: 'Raytheon' },
    // add more customers as needed
  ])

  const workInstruction = await WorkInstructions.create({
    customerId: c.id,
    title: 'Enter the DFM Tanks and inspect for corrosion issues',
  })

  console.log('successfully seeded')
}
