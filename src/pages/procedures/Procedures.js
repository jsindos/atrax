import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useQuery } from '@apollo/client'
import { queries } from '@/queries'
import { useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { ReloadIcon } from '@radix-ui/react-icons'
import { BackButton } from '../WorkInstructionDetail'

const ProceduresPage = () => {
  const { id } = useParams()
  const { data: { workInstructions } = {}, loading } = useQuery(queries.WorkInstructions)
  const [selectedRow, setSelectedRow] = useState(null)

  const workInstruction = workInstructions?.find((w) => w.id === Number(id))

  let procedures = workInstruction?.procedures.map((item) => {
    let procedure = { ...item.procedure }
    delete procedure.steps
    return procedure
  })

  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between row pt-8">
        <h3> Procedures </h3>
        <BackButton
          onClick={() => navigate(`/customers/${workInstruction.customer.id}/work_instructions`)}
        />
      </div>
      {loading ? (
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          <div />
        </>
      )}

      {procedures && procedures.length > 0 && (
        <div className="container mx-auto py-10 flex">
          <div className="w-2/5 pr-2">
            <DataTable setSelectedRow={setSelectedRow} columns={columns} data={procedures} />
          </div>
          <div className="w-3/5 pl-2">
            <DataTable setSelectedRow={setSelectedRow} columns={columns} data={procedures} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProceduresPage
