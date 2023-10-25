import React, { useState } from 'react'
import { saveWithToast } from '@/utils'
import { DataTable } from './data-table'
import { DataTableUseExisting } from './data-table-use-existing'
import { useQuery, useMutation } from '@apollo/client'
import { queries, mutations } from '@/queries'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

import { useNavigate, useParams } from 'react-router-dom'
import { ReloadIcon } from '@radix-ui/react-icons'
import { BackButton } from '../WorkInstructionDetail'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import NestedSteps from './NestedSteps'
import CreateStepDialog from './CreateStepDialog'

const ProceduresPage = () => {
  const { workInstructionId } = useParams()

  const {
    data: { workInstruction } = {},
    loading,
    refetch
  } = useQuery(queries.WorkInstruction, {
    variables: { id: Number(workInstructionId) }
  })

  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedDialogRow, setSelectedDialogRow] = useState(null)

  // State variable to hold the procedureIds of the imported procedures
  const [importedProcedureIds, setImportedProcedureIds] = useState([])

  const { toast } = useToast()

  const procedures = workInstruction?.procedures.map((item) => {
    const procedure = { ...item.procedure, index: item.index }
    return procedure
  })

  let selectedProcedure

  if (procedures && selectedRow) {
    selectedProcedure = procedures.find((procedure) => procedure.id === selectedRow.id)
  }

  const [createProcedureDialog, setCreateProcedureDialog] = useState()
  const [useExistingProcedureDialog, setUseExistingProcedureDialog] = useState()

  const navigate = useNavigate()

  const [title, setTitle] = useState('')

  const [createProcedureMutation] = useMutation(mutations.CreateProcedure, {
    refetchQueries: [{ query: queries.Procedures }]
  })

  const [isCreating, setIsCreating] = useState()

  // Then you can use createProcedure as a function
  const createProcedure = async (procedureTitle) => {
    const procedureInput = {
      title: procedureTitle,
      workInstructionId: Number(workInstructionId)
    }

    setIsCreating(true)
    try {
      await saveWithToast(
        () =>
          createProcedureMutation({
            variables: {
              procedure: procedureInput
            }
          }),
        toast,
        'Procedure Created',
        setIsCreating
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreating(false)
      setCreateProcedureDialog(false)
    }
  }

  const columns = [
    {
      accessorKey: 'title',
      header: 'Procedure'
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => deleteProcedure(row.original.id)}>
                {isDeletingProcedure
                  ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      Deleting
                    </>
                    )
                  : (
                      'Delete Procedure'
                    )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  unassignProcedureFromWorkInstruction(row.original.id, workInstruction.id)}
              >
                {isCreating
                  ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      Unassigning
                    </>
                    )
                  : (
                      'Unassign Procedure'
                    )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const [isDeletingProcedure, setIsDeletingProcedure] = useState()

  const [deleteProcedureMutation] = useMutation(mutations.DeleteProcedure)

  const deleteProcedure = async (id) => {
    setIsDeletingProcedure(true)
    try {
      await saveWithToast(
        () =>
          deleteProcedureMutation({
            variables: {
              id
            }
          }),
        toast,
        'Procedure Deleted',
        setIsDeletingProcedure
      )
      // After successful deletion, refetch the data

      refetch()
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeletingProcedure(false)
    }
  }

  const columnsUseExisting = [
    {
      accessorKey: 'procedureTitle',
      header: 'Title'
    },
    {
      accessorKey: 'customerName',
      header: 'Customer'
    },
    {
      id: 'select',
      header: function ({ table }) {
        return <div> </div>
      },
      cell: function ({ row }) {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              setSelectedRow(value ? row : null)
            }}
            aria-label='Select row'
          />
        )
      },
      enableSorting: false,
      enableHiding: false
    }
  ]

  const { data: { procedures: allProcedures } = {} } = useQuery(
    queries.Procedures
  )

  const filteredProcedures = allProcedures?.filter(
    (procedure) =>
      !procedure.workInstructions.some(
        (workInstruction) => workInstruction?.id === workInstructionId
      )
  )

  const transformedAllProcedures = filteredProcedures?.map((procedure) => ({
    procedureId: procedure.id,
    procedureTitle: procedure.title,
    customerId: procedure.workInstructions[0]?.customer?.id || null,
    customerName: procedure.workInstructions[0]?.customer?.name || null
  }))

  const [assignProcedureMutation] = useMutation(mutations.AssignProcedureToWorkInstruction)

  const assignProcedureToWorkInstruction = async (
    procedureId,
    workInstructionId,
    isDuplicating
  ) => {
    try {
      await saveWithToast(
        () =>
          assignProcedureMutation({
            variables: {
              procedureId: procedureId,
              workInstructionId: workInstructionId,
              isDuplicating
            }
          }),
        toast,
        'Procedure Created',
        setIsCreating
      )
      // Add the importedProcedureId to the array
      setImportedProcedureIds((prevIds) => [...prevIds, procedureId])
      refetch()
    } catch (error) {
      console.error(error)
    } finally {
      setUseExistingProcedureDialog(false)
    }
  }

  const [unassignProcedureMutation] = useMutation(mutations.UnassignProcedureFromWorkInstruction)

  const unassignProcedureFromWorkInstruction = async (procedureId, workInstructionId) => {
    try {
      await saveWithToast(
        () =>
          unassignProcedureMutation({
            variables: {
              procedureId: procedureId,
              workInstructionId: workInstructionId
            }
          }),
        toast,
        'Procedure Unassigned',
        setIsCreating
      )
      // Remove the unassignedProcedureId from the array
      setImportedProcedureIds((prevIds) => prevIds.filter((id) => id !== procedureId))
      refetch()
    } catch (error) {
      console.error(error)
    } finally {
      setUseExistingProcedureDialog(false)
    }
  }

  return (
    <div className='container mx-auto px-4'>
      <div className='flex justify-between row pt-8'>
        <h3> Procedures </h3>
        <BackButton
          onClick={() => navigate(`/customers/${workInstruction.customer.id}/work_instructions`)}
        />
      </div>
      {loading
        ? (
          <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
          )
        : (
          <>
            <div />
          </>
          )}

      <div className='mx-auto flex pt-8'>
        <div className='w-2/5 pr-2'>
          <Dialog open={createProcedureDialog} onOpenChange={setCreateProcedureDialog}>
            <DialogTrigger asChild>
              <Button>Create Procedure</Button>
            </DialogTrigger>
            <DialogContent className='Dialog'>
              <DialogHeader>
                <DialogTitle>Create Procedure</DialogTitle>
              </DialogHeader>
              <Textarea
                className='mt-8'
                style={{ minHeight: 150 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <DialogFooter>
                <Button type='submit' onClick={() => createProcedure(title)}>
                  {isCreating
                    ? (
                      <>
                        <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                        Creating
                      </>
                      )
                    : (
                        'Create Procedure'
                      )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={useExistingProcedureDialog} onOpenChange={setUseExistingProcedureDialog}>
            <DialogTrigger asChild>
              <Button className='ml-2'>Use Existing Procedure</Button>
            </DialogTrigger>

            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Use Existing Procedure</DialogTitle>
                <DialogDescription>Info about duplicating/importing procedure</DialogDescription>
              </DialogHeader>

              <div className='container mx-auto py-10'>
                <DataTableUseExisting
                  setSelectedDialogRow={setSelectedDialogRow}
                  columns={columnsUseExisting}
                  // Filter out all imported procedures from the data array
                  data={transformedAllProcedures?.filter(
                    (procedure) => !importedProcedureIds.includes(procedure.procedureId)
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type='submit'
                  onClick={() => {
                    if (selectedDialogRow) {
                      assignProcedureToWorkInstruction(
                        selectedDialogRow.procedureId,
                        workInstruction.id,
                        true
                      )
                    }
                  }}
                >
                  {isCreating
                    ? (
                      <>
                        <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                        Creating
                      </>
                      )
                    : (
                        'Duplicate procedure'
                      )}
                </Button>
                <Button
                  type='submit'
                  onClick={() => {
                    if (selectedDialogRow) {
                      assignProcedureToWorkInstruction(
                        selectedDialogRow.procedureId,
                        workInstruction.id
                      )
                    }
                  }}
                >
                  {isCreating
                    ? (
                      <>
                        <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                        Creating
                      </>
                      )
                    : (
                        'Import procedure'
                      )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {procedures && procedures.length > 0 && (
            <DataTable
              setSelectedRow={setSelectedRow}
              columns={columns}
              data={procedures}
              isDeletingProcedure={isDeletingProcedure}
            />
          )}
        </div>
        <div className='w-3/5 pl-2'>
          {
            selectedProcedure && <CreateStepDialog procedureId={selectedProcedure.id} />
          }
          {
            selectedProcedure && selectedProcedure.steps.length > 0
              ? <NestedSteps steps={selectedProcedure.steps.map(s => ({ ...s, procedureId: selectedProcedure.id }))} />
              : <p className='mt-8' style={{ color: '#999' }}>No steps yet</p>
          }
        </div>
      </div>
    </div>
  )
}

export default ProceduresPage
