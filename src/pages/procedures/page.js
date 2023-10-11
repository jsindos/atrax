import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useQuery } from '@apollo/client'
import { queries } from '@/queries'

import { useParams } from 'react-router-dom'

const ProceduresPage = () => {
  const { id } = useParams()
  const { loading, error, data } = useQuery(queries.WorkInstructionProcedures, {
    variables: { workInstructionId: id },
  })

  return (
    <div>
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <div className="container mx-auto py-10"></div>
        </>
      )}
    </div>
  )
}

export default ProceduresPage
