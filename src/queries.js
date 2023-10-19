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
    }
  `
}

export const mutations = {
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
          title
          id
          childSteps {
            title
            id
          }
        }
      }
    }
  `,
  SaveStep: gql`
    mutation SaveStep($step: StepInput!) {
      saveStep(step: $step) {
        id
        title
        index
      }
    }
  `,
  SaveChildStep: gql`
    mutation SaveChildStep($childStep: ChildStepInput!) {
      saveChildStep(childStep: $childStep) {
        id
        title
        index
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
                title
                id
                childSteps {
                  title
                  id
                }
              }
            }
          }
        }
      }
    }
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
    mutation AssignProcedureToWorkInstruction($procedureId: ID!, $workInstructionId: ID!) {
      assignProcedureToWorkInstruction(
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
              id
              title
              childSteps {
                id
                title
              }
            }
          }
        }
      }
    }
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
    mutation UpdateStepIndices($steps: [StepInput!]!) {
      updateStepIndices(steps: $steps) {
        id
        title
        index
      }
    }
  `,
  DeleteStep: gql`
    mutation DeleteStep($id: ID!) {
      deleteStep(id: $id) {
        id
        steps {
          id
          title
          childSteps {
            id
            title
          }
        }
      }
    }
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
                title
                id
                childSteps {
                  title
                  id
                }
              }
            }
          }
        }
      }
    }
    ${fields.WorkInstructionFields}
  `,
  Warnings: gql`
    query Warnings {
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
        workInstructions {
          id
        }
      }
    }
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
              title
              id
              childSteps {
                title
                id
              }
            }
          }
        }
      }
    }
    ${fields.WorkInstructionFields}
  `,
  Procedures: gql`
    query Procedures {
      procedures {
        id
        title
        workInstructions {
          id
          customer {
            id
            name
          }
        }
      }
    }
  `,
  WorkInstruction: gql`
    query WorkInstruction($id: Int!) {
      workInstruction(id: $id) {
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
              title
              id
              index
              childSteps {
                title
                id
              }
            }
          }
        }
      }
    }
    ${fields.WorkInstructionFields}
  `,
  Step: gql`
    query Step($id: Int!) {
      step(id: $id) {
        title
        id
        childSteps {
          title
          id
        }
      }
    }
  `
}
