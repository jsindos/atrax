import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

import '@/styles/index.css'
import WorkInstructionsPage from './pages/work_instructions/WorkInstructions.js'
import WorkInstructionDetail from './pages/WorkInstructionDetail.js'
import ProceduresPage from './pages/procedures/Procedures.js'
import { Toaster } from './components/ui/toaster.js'
import StepDetail from './pages/StepDetail.js'

import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'
import WorkInstructionWarnings from './pages/WorkInstructionWarnings/WorkInstructionWarnings.js'
import StepWarnings from './pages/StepWarnings.js'
import WorkInstructionEquipment from './pages/WorkInstructionWarnings/WorkInstructionEquipment.js'
import WorkInstructionIsolations from './pages/WorkInstructionIsolations.js'
import WorkInstructionMaterials from './pages/WorkInstructionMaterials.js'

const BASE_URL = 'http://localhost:8080'

const link = createUploadLink({
  uri: `${BASE_URL}/graphql`,
  credentials: 'include'
})

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

loadDevMessages()
loadErrorMessages()

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path='/work_instructions/:id' element={<WorkInstructionDetail />} />
          <Route path='/work_instructions/:id/warnings' element={<WorkInstructionWarnings />} />
          <Route path='/work_instructions/:id/equipment' element={<WorkInstructionEquipment />} />
          <Route path='/work_instructions/:id/isolations' element={<WorkInstructionIsolations />} />
          <Route path='/work_instructions/:id/materials' element={<WorkInstructionMaterials />} />
          <Route path='/' element={<Navigate to='/customers/1/work_instructions' />} />
          <Route path='/customers/:customerId/work_instructions' element={<WorkInstructionsPage />} />
          <Route path='/work_instructions/:workInstructionId/procedures' element={<ProceduresPage />} />
          <Route path='/work_instructions/:workInstructionId/procedures/:procedureId/steps/:stepId' element={<StepDetail />} />
          <Route path='/work_instructions/:workInstructionId/procedures/:procedureId/steps/:stepId/warnings' element={<StepWarnings />} />
        </Routes>
      </Router>
    </ApolloProvider>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(
  <>
    <Toaster />
    <App />
  </>,
  wrapper
)
