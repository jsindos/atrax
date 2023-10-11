import { gql } from '@apollo/client'

export const queries = {
  Customers: gql`
    query Customers {
      customers {
        id
        name
        workInstructions {
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
  `
}
