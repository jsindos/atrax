const Sequelize = require('sequelize')
// const moment = require('moment')
const { Model } = Sequelize

module.exports = ({ sequelize, models, services }, DataTypes) => {
  // Customers
  class Customers extends Model {
    static associate (models) {
      Customers.hasMany(models.WorkInstructions)
      Customers.hasMany(models.Warnings)
    }
  }

  Customers.modelName = 'Customers'

  Customers.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.TEXT
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'customers'
    }
  )

  // WorkInstructions
  class WorkInstructions extends Model {
    static associate (models) {
      WorkInstructions.belongsTo(Customers)
      WorkInstructions.belongsToMany(models.Warnings, {
        through: models.WorkInstructionsWarnings,
        foreignKey: 'workInstructionId'
      })
      WorkInstructions.belongsToMany(models.Procedures, {
        through: models.WorkInstructionsProcedures,
        foreignKey: 'workInstructionId'
      })
    }
  }

  WorkInstructions.modelName = 'WorkInstructions'

  WorkInstructions.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: DataTypes.TEXT,
      draftingOrganisation: DataTypes.TEXT,
      hoursToComplete: DataTypes.TEXT,

      // ESWBS Codes
      system: DataTypes.TEXT,
      shipSystem: DataTypes.TEXT,
      subsystem: DataTypes.TEXT,

      // Ran Codes
      SYSCOM: DataTypes.TEXT,
      MIPSeries: DataTypes.TEXT,
      activityNumber: DataTypes.TEXT,

      CMC: DataTypes.STRING
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'workInstructions'
    }
  )

  // Warnings (Warnings, Cautions and Notes)
  class Warnings extends Model {
    static associate (models) {
      Warnings.belongsToMany(models.WorkInstructions, {
        through: models.WorkInstructionsWarnings,
        foreignKey: 'warningId'
      })
      Warnings.belongsToMany(models.Steps, {
        through: models.StepsWarnings,
        foreignKey: 'warningId'
      })
      Warnings.belongsTo(models.Customers)
    }
  }

  Warnings.modelName = 'Warnings'

  Warnings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      content: DataTypes.TEXT,
      // additional enum, may or may not only apply to 'type: warning'
      type: DataTypes.STRING,
      // warning, caution or note
      warningType: DataTypes.STRING,

      // `isDefault` for a customer, at the moment warnings-customers is many-to-one, if it becomes many-to-many this will have to live on the through table
      isDefault: DataTypes.BOOLEAN
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'warnings'
    }
  )

  // WorkInstructionsWarnings (through table)
  class WorkInstructionsWarnings extends Model {
    static associate (models) {}
  }

  WorkInstructionsWarnings.modelName = 'WorkInstructionsWarnings'

  WorkInstructionsWarnings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'workInstructionsWarnings'
    }
  )

  // WorkInstructionsProcedures (through table)
  class WorkInstructionsProcedures extends Model {
    static associate (models) {}
  }

  WorkInstructionsProcedures.modelName = 'WorkInstructionsProcedures'

  WorkInstructionsProcedures.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      procedureIndex: DataTypes.INTEGER
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'workInstructionsProcedures'
    }
  )

  // Procedures
  class Procedures extends Model {
    static associate (models) {
      Procedures.belongsToMany(models.WorkInstructions, {
        through: models.WorkInstructionsProcedures,
        foreignKey: 'procedureId'
      })
      Procedures.hasMany(models.Steps)
    }
  }

  Procedures.modelName = 'Procedures'

  Procedures.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: DataTypes.TEXT,
      index: DataTypes.VIRTUAL
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'procedures'
    }
  )

  // StepsWarnings (through table)
  class StepsWarnings extends Model {
    static associate (models) {}
  }

  StepsWarnings.modelName = 'StepsWarnings'

  StepsWarnings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'stepsWarnings'
    }
  )

  // Steps
  class Steps extends Model {
    static associate (models) {
      Steps.belongsTo(models.Procedures)
      Steps.belongsToMany(models.Warnings, {
        through: models.StepsWarnings,
        foreignKey: 'stepId'
      })
      Steps.hasMany(models.ChildSteps)
      Steps.hasMany(models.Images)
    }
  }

  Steps.modelName = 'Steps'

  Steps.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: DataTypes.TEXT,
      index: DataTypes.INTEGER
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'steps'
    }
  )

  // ChildSteps
  class ChildSteps extends Model {
    static associate (models) {
      ChildSteps.belongsTo(models.Steps)
    }
  }

  ChildSteps.modelName = 'ChildSteps'

  ChildSteps.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: DataTypes.TEXT,
      index: DataTypes.INTEGER
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'childSteps'
    }
  )

  // Images
  class Images extends Model {
    static associate (models) {
      Images.belongsTo(models.Steps)
    }
  }

  Images.modelName = 'Images'

  Images.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      index: DataTypes.INTEGER,
      uri: DataTypes.STRING
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'images'
    }
  )

  return [
    Customers,
    WorkInstructions,
    WorkInstructionsWarnings,
    Warnings,
    WorkInstructionsProcedures,
    Procedures,
    Steps,
    ChildSteps,
    StepsWarnings,
    Images
  ]
}
