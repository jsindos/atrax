// work_instructions/Home.js
import React from 'react'
import { Button } from '@/components/ui/button'

const WorkInstructionsPage = ({ customerId }) => {
  return (
    <div>
      <Button>{`Customer ID: ${customerId}`}</Button>
    </div>
  )
}

export default WorkInstructionsPage
