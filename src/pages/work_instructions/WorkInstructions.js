import React, { useState } from 'react'
import { DataTable } from './data-table'
import { MoreHorizontal } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/ui/use-toast'

import { queries, mutations } from '@/queries'
import { useQuery, useMutation } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { saveWithToast } from '@/utils'

const DialogComponent = ({ customers, selectedCustomer, workInstruction }) => {
  const [localCustomer, setLocalCustomer] = useState(
    customers && customers.length > 0 ? selectedCustomer : null
  )

  const [activityNumber, setActivityNumber] = useState('')

  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)

  const handleSelectChangeDialog = (value) => {
    const localCustomer = customers.find((customer) => customer.id === value)
    setLocalCustomer(localCustomer) // Update local state
  }

  const handleInputChangeDialog = (event) => {
    setActivityNumber(event.target.value) // Update input value state
  }

  const handleSaveChangesClick = () => {
    console.log(localCustomer)
    console.log(activityNumber)
    console.log(workInstruction)
    duplicateWorkInstruction(workInstruction.id, localCustomer.id, activityNumber)
    setShowNewCustomerDialog(false)
    navigate(`/customers/${localCustomer.id}/work_instructions`)
  }

  const [deleteWorkInstructionMutation] = useMutation(mutations.DeleteWorkInstruction)

  const [isDeleting, setIsDeleting] = useState()
  const { toast } = useToast()

  const deleteWorkInstruction = async (id) => {
    setIsDeleting(true)
    try {
      await saveWithToast(
        () =>
          deleteWorkInstructionMutation({
            variables: {
              id,
            },
          }),
        toast,
        'Work Instruction Deleted',
        setIsDeleting
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }
  const navigate = useNavigate()

  const [duplicateWorkInstructionMutation] = useMutation(mutations.DuplicateWorkInstruction)

  const [isDuplicating, setIsDuplicating] = useState()

  const duplicateWorkInstruction = async (
    existingWorkInstructionId,
    customerId,
    newActivityNumber
  ) => {
    setIsDuplicating(true)
    try {
      await saveWithToast(
        () =>
          duplicateWorkInstructionMutation({
            variables: {
              existingWorkInstructionId,
              customerId,
              newActivityNumber,
            },
          }),
        toast,
        'Work Instruction Duplicated',
        setIsDuplicating
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Work Instruction</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate(`/work_instructions/${workInstruction.id}`)}>
            Edit Work Instruction
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteWorkInstruction(workInstruction.id)}>
            {isDeleting ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Deleting
              </>
            ) : (
              'Delete Work Instruction'
            )}
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>Duplicate Work Instruction</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuLabel>Procedures</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate(`/work_instructions/${workInstruction.id}/procedures`)}
          >
            Edit Procedures
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Duplicate Existing Work Instruction</DialogTitle>
          <DialogDescription>Some details about creating a Work Instruction ...</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Customer
            </Label>
            <Select value={localCustomer?.id} onValueChange={handleSelectChangeDialog}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={localCustomer?.name || 'Customer'} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activityNumber" className="text-right">
              Activity Number
            </Label>
            <Input
              id="ActivityNumber"
              defaultValue=""
              className="col-span-3"
              onChange={handleInputChangeDialog}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveChangesClick}>
            {isDuplicating ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Duplicating
              </>
            ) : (
              'Save changes'
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const WorkInstructionsPage = () => {
  const { customerId } = useParams()
  const { data: { customers } = {}, loading } = useQuery(queries.Customers)
  console.log(customers)

  const customer = customers?.find((customer) => customer.id === Number(customerId))

  const navigate = useNavigate()

  const handleSelectChange = (selectedCustomerId) => {
    navigate(`/customers/${selectedCustomerId}/work_instructions`)
  }

  const [createWorkInstructionMutation] = useMutation(mutations.CreateWorkInstruction)

  const [isCreating, setIsCreating] = useState()

  const { toast } = useToast()

  console.log('1', customer)

  const createWorkInstruction = async () => {
    console.log('2', customer)
    const result = await saveWithToast(
      () =>
        createWorkInstructionMutation({
          variables: {
            workInstruction: {
              customerId: customer.id,
            },
          },
        }),
      toast,
      'Work Instruction Created',
      setIsCreating
    )
    const workInstructions = result.data.createWorkInstruction.workInstructions
    const latest_id_work_instruction = workInstructions.reduce((max, obj) =>
      max.id > obj.id ? max : obj
    )

    navigate(`/work_instructions/${latest_id_work_instruction.id}`)
  }

  const columns = [
    {
      accessorKey: 'CMC',
      header: 'CMC',
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'equipment',
      header: 'Equipment',
    },
    {
      accessorKey: 'system',
      header: 'System',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const workInstruction = row.original

        return (
          <DialogComponent
            customers={customers}
            selectedCustomer={customer}
            workInstruction={workInstruction}
          >
            {' '}
          </DialogComponent>
        )
      },
    },
  ]

  return (
    <div>
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <Button
            disabled={isCreating}
            className="self-end flex"
            onClick={() => {
              createWorkInstruction()
            }}
          >
            {isCreating ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Creating
              </>
            ) : (
              'Create Work Instruction'
            )}
          </Button>
          <Select value={customer?.id} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[180px]">
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
          <div className="container mx-auto py-10">
            <DataTable columns={columns} data={customer.workInstructions} />
          </div>
        </>
      )}
    </div>
  )
}

export default WorkInstructionsPage
