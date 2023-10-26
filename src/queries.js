import { gql } from '@apollo/client'

const fields = {
  WorkInstructionFields: gql`
    fragment WorkInstructionFields on WorkInstruction {
      id
      title
      draftingOrganisation
      hoursToComplete
      system
      shipSystem
      subsystem
      SYSCOM
      MIPSeries
      activityNumber
      CMC {
        id
        code
      }
    }
  `,
  WarningFields: gql`
    fragment WarningFields on Warning {
      id
      isDefault
      type
      content
      warningType
    }
  `,
  StepFields: gql`
    fragment StepFields on Step {
      id
      title
      parentId
      index
    }
  `
}

export const mutations = {
  CreateEquipment: gql`
    mutation createEquipment($equipment: EquipmentInput!, $workInstructionId: Int!) {
      createEquipment(equipment: $equipment, workInstructionId: $workInstructionId) {
        id
        MELCode
        name
      }
    }
  `,
  SaveEquipment: gql`
    mutation saveEquipment($equipment: EquipmentInput!) {
      saveEquipment(equipment: $equipment) {
        id
        MELCode
        name
      }
    }
  `,
  DeleteStepImage: gql`
    mutation deleteStepImage($imageId: ID!) {
      deleteStepImage(imageId: $imageId) {
        id
        images {
          id
          uri
        }
      }
    }
  `,
  CreateStepImage: gql`
    mutation createStepImage($stepId: ID!, $image: Upload!) {
      createStepImage(stepId: $stepId, image: $image) {
        id
        images {
          id
          uri
        }
      }
    }
  `,
  CreateWarning: gql`
    mutation CreateWarning($warning: WarningInput!) {
      createWarning(warning: $warning) {
        id
        isDefault
        type
        content
        warningType
        customer {
          id
          name
        }
      }
    }
  `,
  SaveWarning: gql`
    mutation SaveWarning($warning: WarningInput!) {
      saveWarning(warning: $warning) {
        id
        isDefault
        type
        content
        warningType
        customer {
          id
          name
        }
      }
    }
  `,
  SaveWorkInstruction: gql`
    mutation SaveWorkInstruction($workInstruction: WorkInstructionInput!) {
      saveWorkInstruction(workInstruction: $workInstruction) {
        ...WorkInstructionFields
      }
    }
    ${fields.WorkInstructionFields}
  `,
  CreateStep: gql`
    mutation CreateStep($step: StepInput!) {
      createStep(step: $step) {
        id
        title
        steps {
          ...StepFields
        }
      }
    }
    ${fields.StepFields}
  `,
  SaveStep: gql`
    mutation SaveStep($step: StepInput!) {
      saveStep(step: $step) {
        id
        title
        warnings {
          id
        }
      }
    }
  `,
  CreateWorkInstruction: gql`
    mutation CreateWorkInstruction($workInstruction: WorkInstructionInput!) {
      createWorkInstruction(workInstruction: $workInstruction) {
        id
        workInstructions {
          ...WorkInstructionFields
          customer {
            id
            name
          }
          procedures {
            id
            index
            procedure {
              id
              title
              steps {
                ...StepFields
              }
            }
          }
        }
      }
    }
    ${fields.StepFields}
    ${fields.WorkInstructionFields}
  `,
  DeleteWorkInstruction: gql`
    mutation DeleteWorkInstruction($id: ID!) {
      deleteWorkInstruction(id: $id) {
        id
        workInstructions {
          ...WorkInstructionFields
        }
      }
    }
    ${fields.WorkInstructionFields}
  `,
  DuplicateWorkInstruction: gql`
    mutation DuplicateWorkInstruction(
      $existingWorkInstructionId: ID!
      $customerId: ID!
      $newActivityNumber: String!
    ) {
      duplicateWorkInstruction(
        existingWorkInstructionId: $existingWorkInstructionId
        customerId: $customerId
        newActivityNumber: $newActivityNumber
      ) {
        id
        workInstructions {
          ...WorkInstructionFields
        }
      }
    }
    ${fields.WorkInstructionFields}
  `,
  CreateProcedure: gql`
    mutation CreateProcedure($procedure: ProcedureInput!) {
      createProcedure(procedure: $procedure) {
        id
        procedures {
          id
        }
      }
    }
  `,
  AssignProcedureToWorkInstruction: gql`
    mutation AssignProcedureToWorkInstruction(
      $procedureId: ID!
      $workInstructionId: ID!
      $isDuplicating: Boolean
    ) {
      assignProcedureToWorkInstruction(
        procedureId: $procedureId
        workInstructionId: $workInstructionId
        isDuplicating: $isDuplicating
      ) {
        id
        procedures {
          id
          index
          procedure {
            id
            title
            steps {
              ...StepFields
            }
          }
        }
      }
    }
    ${fields.StepFields}
  `,

  UnassignProcedureFromWorkInstruction: gql`
    mutation UnassignProcedureFromWorkInstruction($procedureId: ID!, $workInstructionId: ID!) {
      unassignProcedureFromWorkInstruction(
        procedureId: $procedureId
        workInstructionId: $workInstructionId
      ) {
        id
        procedures {
          id
          index
          procedure {
            id
            title
            steps {
              ...StepFields
            }
          }
        }
      }
    }
    ${fields.StepFields}
  `,

  DeleteProcedure: gql`
    mutation DeleteProcedure($id: ID!) {
      deleteProcedure(id: $id) {
        id
        procedures {
          id
        }
      }
    }
  `,

  UpdateProcedureIndices: gql`
    mutation UpdateProcedureIndices($procedures: [ProcedureInput!]!, $workInstructionId: ID!) {
      updateProcedureIndices(procedures: $procedures, workInstructionId: $workInstructionId) {
        id
        procedures {
          id
          index
        }
      }
    }
  `,

  UpdateStepIndices: gql`
    mutation UpdateStepIndices($steps: [StepInput!]) {
      updateStepIndices(steps: $steps) {
        ...StepFields
      }
    }
    ${fields.StepFields}
  `,
  DeleteStep: gql`
    mutation DeleteStep($id: ID!) {
      deleteStep(id: $id) {
        id
        steps {
          ...StepFields
        }
      }
    }
    ${fields.StepFields}
  `
}

export const queries = {
  Customers: gql`
    query Customers {
      customers {
        id
        name
        workInstructions {
          ...WorkInstructionFields
          procedures {
            id
            index
            procedure {
              id
              title
              steps {
                ...StepFields
              }
            }
          }
        }
      }
    }
    ${fields.StepFields}
    ${fields.WorkInstructionFields}
  `,
  Warnings: gql`
    query Warnings {
      warnings {
        ...WarningFields
        customer {
          id
          name
        }
        workInstructions {
          id
        }
      }
    }
    ${fields.WarningFields}
  `,
  WorkInstructions: gql`
    query WorkInstructions {
      workInstructions {
        ...WorkInstructionFields
        warnings {
          id
          isDefault
          type
          content
          warningType
          customer {
            id
            name
          }
        }
        customer {
          id
          name
        }
        procedures {
          id
          index
          procedure {
            id
            title
            steps {
              ...StepFields
            }
          }
        }
      }
    }
    ${fields.StepFields}
    ${fields.WorkInstructionFields}
  `,
  Procedures: gql`
    query Procedures {
      procedures {
        id
        title
        steps {
          ...StepFields
        }
        workInstructions {
          id
          customer {
            id
            name
          }
        }
      }
    }
    ${fields.StepFields}
  `,
  Equipment: gql`
    query Equipment {
      equipment {
        id
        name
        MELCode
        CMC {
          id
          code
        }
      }
    }
  `,
  WorkInstruction: gql`
    query WorkInstruction($id: Int!) {
      workInstruction(id: $id) {
        ...WorkInstructionFields
        equipment {
          id
          name
          MELCode
        }
        warnings {
          ...WarningFields
          customer {
            id
            name
          }
        }
        customer {
          id
          name
        }
        procedures {
          id
          index
          procedure {
            id
            title
            steps {
              ...StepFields
            }
          }
        }
      }
    }
    ${fields.StepFields}
    ${fields.WorkInstructionFields}
    ${fields.WarningFields}
  `,
  Step: gql`
    query Step($id: Int!) {
      step(id: $id) {
        ...StepFields
        images {
          id
          uri
        }
        warnings {
          ...WarningFields
        }
      }
    }
    ${fields.StepFields}
    ${fields.WarningFields}
  `,
  Steps: gql`
    query Steps {
      steps {
        ...StepFields
      }
    }
    ${fields.StepFields}
  `
}
