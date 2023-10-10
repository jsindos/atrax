const Sequelize = require('sequelize')
const moment = require('moment')
const {
  Model
} = Sequelize

// class Customers extends Model {
//   static associate (models) {
//   }
// };

// Customers.modelName = 'Customers'

// Customers.init({
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
// }, {
//   timestamps: true,
//   sequelize,
//   modelName: 'products'
// })

module.exports = ({ sequelize, models, services }, DataTypes) => {

  // Customers
  class Customers extends Model {
    static associate (models) {
      Customers.hasMany(models.WorkInstructions)
    }
  };

  Customers.modelName = 'Customers'

  Customers.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
  }, {
    timestamps: true,
    sequelize,
    modelName: 'customers'
  })

  // WorkInstructions
  class WorkInstructions extends Model {
    static associate (models) {
      WorkInstructions.belongsTo(Customers)
    }
  };

  WorkInstructions.modelName = 'WorkInstructions'

  WorkInstructions.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: DataTypes.STRING,
  }, {
    timestamps: true,
    sequelize,
    modelName: 'workInstructions'
  })
  
  // WorkInstructionsProcedures
  class WorkInstructionsProcedures extends Model {
    static associate (models) {
    }
  };

  WorkInstructionsProcedures.modelName = 'WorkInstructionsProcedures'

  WorkInstructionsProcedures.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  }, {
    timestamps: true,
    sequelize,
    modelName: 'workInstructionsProcedures'
  })

  // Procedures
  class Procedures extends Model {
    static associate (models) {
    }
  };

  Procedures.modelName = 'Procedures'

  Procedures.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  }, {
    timestamps: true,
    sequelize,
    modelName: 'procedures'
  })

  // Steps
  class Steps extends Model {
    static associate (models) {
    }
  };

  Steps.modelName = 'Steps'

  Steps.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  }, {
    timestamps: true,
    sequelize,
    modelName: 'steps'
  })

  // ChildSteps
  class ChildSteps extends Model {
    static associate (models) {
    }
  };

  ChildSteps.modelName = 'ChildSteps'

  ChildSteps.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  }, {
    timestamps: true,
    sequelize,
    modelName: 'childSteps'
  })

  return [Customers, WorkInstructions, WorkInstructionsProcedures, Procedures, Steps, ChildSteps]
}
