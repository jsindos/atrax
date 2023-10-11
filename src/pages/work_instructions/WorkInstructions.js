import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { queries } from '@/queries'
import { useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'

const WorkInstructionsPage = () => {
  const { customerId } = useParams()
  const { data: { customers } = {}, loading } = useQuery(queries.Customers)

  const customer = customers?.find((customer) => customer.id === Number(customerId))

  const navigate = useNavigate()

  const handleSelectChange = (selectedCustomerId) => {
    navigate(`/customers/${selectedCustomerId}/work_instructions`)
  }

  return (
    <div>
      {
        loading
          ? (
            <div className='loader' />
            )
          : (
            <>
              <Select value={customer?.id} onValueChange={handleSelectChange}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder={customer?.name || 'Customer'} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={customer.workInstructions} />
              </div>
            </>
            )
      }
    </div>
  )
}

export default WorkInstructionsPage
