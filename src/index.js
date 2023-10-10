// App.js
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom'

import '@/styles/index.css'
import WorkInstructionsPage from './pages/work_instructions/page.js'

const WorkInstructionsPageWrapper = () => {
  const { customerId } = useParams()
  return <WorkInstructionsPage customerId={customerId} />
}
// const WorkInstructionPageWrapper = () => {
//   const { id } = useParams()
//   return <WorkInstructionsPage id={customerd} />
// }

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/work_instructions/:customerId" element={<WorkInstructionsPageWrapper />} />
        <Route path="/" element={<Navigate to="/work_instructions/1" />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(<App />, wrapper)
