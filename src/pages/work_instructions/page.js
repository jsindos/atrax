import React, { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const WorkInstructionsPage = ({ customerId }) => {
  const customers = [
    { id: '1', name: 'Customer One' },
    { id: '2', name: 'Customer Two' },
    // Add more customers as needed
  ]

  // Find the customer object where customer.id == customerId
  const initialCustomer = customers.find((customer) => customer.id === customerId)

  // State for selected customer
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer)

  // Array of workInstruction objects
  const workInstructions = [
    {
      id: '1',
      title: 'Work Instruction One',
      system: 'System One',
      customerId: '1',
      CMC: 'dummy',
      equipment: 'dummy',
    },
    {
      id: '2',
      title: 'Work Instruction Two',
      system: 'System Two',
      customerId: '1',
      CMC: 'dummy',
      equipment: 'dummy',
    },
    {
      id: '3',
      title: 'Work Instruction Three',
      system: 'System Three',
      customerId: '2',
      CMC: 'dummy',
      equipment: 'dummy',
    },
    {
      id: '4',
      title: 'Work Instruction Four',
      system: 'System Four',
      customerId: '2',
      CMC: 'dummy',
      equipment: 'dummy',
    },

    // Add more workInstructions as needed
  ]

  // State for work instructions of the selected customer
  const [customerWorkInstructions, setCustomerWorkInstructions] = useState([])

  // Effect to update work instructions when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      const newCustomerWorkInstructions = workInstructions.filter(
        (workInstruction) => workInstruction.customerId === selectedCustomer.id
      )
      setCustomerWorkInstructions(newCustomerWorkInstructions)
    }
  }, [selectedCustomer])

  const handleSelectChange = (selectedCustomerId) => {
    const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId)
    setSelectedCustomer(selectedCustomer)
  }

  return (
    <div>
      <Select value={selectedCustomer?.id} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Customer" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={customerWorkInstructions} />
      </div>
    </div>
  )
}

export default WorkInstructionsPage
