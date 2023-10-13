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
  `,
}

export const mutations = {
  SaveWorkInstruction: gql`
    mutation SaveWorkInstruction($workInstruction: WorkInstructionInput!) {
      saveWorkInstruction(workInstruction: $workInstruction) {
        ...WorkInstructionFields
      }
    }
    ${fields.WorkInstructionFields}
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
        }
      }
    }
    ${fields.WorkInstructionFields}
  `,
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
        customers {
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
  WorkInstruction: gql`
    query WorkInstruction($id: Int!) {
      workInstruction(id: $id) {
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
  `,
}
