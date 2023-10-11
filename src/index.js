// App.js
import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

import '@/styles/index.css'
import WorkInstructionsPage from './pages/work_instructions/page.js'
import WorkInstructionDetail from './pages/WorkInstructionDetail.js'
import ProceduresPage from './pages/procedures/page.js'

const BASE_URL = 'http://localhost:8080'

const link = createUploadLink({
  uri: `${BASE_URL}/graphql`,
  credentials: 'include',
})

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/work_instructions/:workInstructionId" element={<WorkInstructionDetail />} />
          <Route path="/" element={<Navigate to="/customer/1/work_instructions" />} />
          <Route
            path="/customer/:customerId/work_instructions"
            element={<WorkInstructionsPage />}
          />
          <Route path="/work_instruction/:id/procedures" element={<ProceduresPage />} />
        </Routes>
      </Router>
    </ApolloProvider>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(<App />, wrapper)
