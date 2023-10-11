import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useQuery } from '@apollo/client'
import { queries } from '@/queries'

import { useNavigate, useParams } from 'react-router-dom'
import { ReloadIcon } from '@radix-ui/react-icons'
import { BackButton } from '../WorkInstructionDetail'

const ProceduresPage = () => {
  const { id } = useParams()
  const { data: { workInstructions } = {}, loading } = useQuery(queries.WorkInstructions)

  const workInstruction = workInstructions?.find(w => w.id === Number(id))

  const navigate = useNavigate()

  return (
    <div className='container mx-auto px-4'>
      <div className='flex justify-between row pt-8'>
        <h3>Update Work Instruction Details</h3>
        <BackButton onClick={() => navigate(`/customers/${workInstruction.customer.id}/work_instructions`)} />
      </div>
      {
      loading
        ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
        : (
          <>
            <div />
          </>
          )
          }
    </div>
  )
}

export default ProceduresPage
