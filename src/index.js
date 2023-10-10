// App.js
import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom'

import '@/styles/index.css'
import WorkInstructionsPage from './pages/work_instructions/page.js'

const WorkInstructionsPageWrapper = () => {
  const { customerId } = useParams()

  const { data: { customers } = {}, loading } = useQuery(Customers)

  return <WorkInstructionsPage customerId={customerId} />
}
// const WorkInstructionPageWrapper = () => {
//   const { id } = useParams()
//   return <WorkInstructionsPage id={customerd} />
// }

const BASE_URL = 'http://localhost:8080'

const link = createUploadLink({
  uri: `${BASE_URL}/graphql`,
  credentials: 'include'
})

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

const Customers = gql`
  query Customers {
    customers {
      id
      name
      workInstructions {
        id
        title
        procedures {
          id
          steps {
            id
            childSteps {
              name
              id
            }
          }
        }
      }
    }
  }
`

const App = () => {
  return (
    <ApolloProvider client={client}>
    <Router>
      <Routes>
        <Route path="/work_instructions/:customerId" element={<WorkInstructionsPageWrapper />} />
        <Route path="/" element={<Navigate to="/work_instructions/1" />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
    </ApolloProvider>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(<App />, wrapper)
