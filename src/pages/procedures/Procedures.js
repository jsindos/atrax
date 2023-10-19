import React, { useState } from 'react'
import { saveWithToast } from '@/utils'
import { DataTable } from './data-table'
import { DataTableSteps } from './data-table-steps'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ProceduresPage = () => {
  const { id } = useParams()

  const {
    data: { workInstruction } = {},
    loading,
    refetch,
  } = useQuery(queries.WorkInstruction, {
    variables: { id: Number(id) },
  })

  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedDialogRow, setSelectedDialogRow] = useState(null)

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
  const [createStepDialog, setCreateStepDialog] = useState()

  const navigate = useNavigate()

  const [title, setTitle] = useState('')

  const [createProcedureMutation] = useMutation(mutations.CreateProcedure)

  const [isCreating, setIsCreating] = useState()

  const createProcedure = async (procedureTitle) => {
    const procedureInput = {
      title: procedureTitle,
      workInstructionId: Number(id),
    }

    setIsCreating(true)
    try {
      await saveWithToast(
        () =>
          createProcedureMutation({
            variables: {
              procedure: procedureInput,
            },
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

  const [stepTitle, setStepTitle] = useState('')

  const [createStepMutation] = useMutation(mutations.CreateStep)

  const [isCreatingStep, setIsCreatingStep] = useState()

  const createStep = async (stepTitle) => {
    const stepInput = {
      title: stepTitle,
      procedureId: selectedProcedure.id,
      index: selectedProcedure.steps.length + 1,
    }

    setIsCreatingStep(true)
    try {
      await saveWithToast(
        () =>
          createStepMutation({
            variables: {
              step: stepInput,
            },
          }),
        toast,
        'Step Created',
        setIsCreatingStep
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingStep(false)
      setCreateStepDialog(false)
    }
  }

  const columns = [
    {
      accessorKey: 'title',
      header: 'Procedure',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const navigate = useNavigate()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => deleteProcedure(row.original.id)}>
                {isDeletingProcedure ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  'Delete Procedure'
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
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
              id,
            },
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

  const [isDeletingStep, setIsDeletingStep] = useState()

  const [deleteStepMutation] = useMutation(mutations.DeleteStep)

  const deleteStep = async (id) => {
    setIsDeletingStep(true)
    try {
      await saveWithToast(
        () =>
          deleteStepMutation({
            variables: {
              id,
            },
          }),
        toast,
        'Step Deleted',
        setIsDeletingStep
      )
      // After successful deletion, refetch the data
      refetch()
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeletingStep(false)
    }
  }

  const columnsSteps = [
    {
      accessorKey: 'title',
      header: 'Steps',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const navigate = useNavigate()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/steps/${row.original.id}`)}>
                Child Steps
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => deleteStep(row.original.id)}>
                {isDeletingStep ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  'Delete Step'
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const columnsUseExisting = [
    {
      accessorKey: 'procedureTitle',
      header: 'Title',
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
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
            aria-label="Select row"
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  const { data: { procedures: allProcedures } = {}, loadingProcedures } = useQuery(
    queries.Procedures
  )

  let transformedAllProcedures = allProcedures?.map((procedure) => ({
    procedureId: procedure.id,
    procedureTitle: procedure.title,
    customerId: procedure.workInstructions[0].customer.id,
    customerName: procedure.workInstructions[0].customer.name,
  }))

  console.log('procedures', transformedAllProcedures)

  const [isDuplicating, setIsDuplicating] = useState()
  const [assignProcedureMutation] = useMutation(mutations.AssignProcedureToWorkInstruction)

  const assignProcedureToWorkInstruction = async (procedureId, workInstructionId) => {
    setIsDuplicating(true)

    try {
      await saveWithToast(() =>
        assignProcedureMutation({
          variables: {
            procedureId: procedureId,
            workInstructionId: workInstructionId,
          },
        })
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDuplicating(false)
      setUseExistingProcedureDialog(false)
    }
  }

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

      <div className="container mx-auto py-10 flex">
        <div className="w-2/5 pr-2">
          <Dialog open={createProcedureDialog} onOpenChange={setCreateProcedureDialog}>
            <DialogTrigger asChild>
              <Button>Create Procedure</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Procedure</DialogTitle>
                <DialogDescription>Info about creating procedure</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    defaultValue=""
                    className="col-span-3"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => createProcedure(title)}>
                  {isCreating ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    'Create Procedure'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={useExistingProcedureDialog} onOpenChange={setUseExistingProcedureDialog}>
            <DialogTrigger asChild>
              <Button>Use Existing Procedure</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Use Existing Procedure</DialogTitle>
                <DialogDescription>Info about duplicating/importing procedure</DialogDescription>
              </DialogHeader>

              <div className="container mx-auto py-10">
                <DataTableUseExisting
                  setSelectedDialogRow={setSelectedDialogRow}
                  columns={columnsUseExisting}
                  data={transformedAllProcedures}
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => {
                    console.log(selectedDialogRow)
                    if (selectedDialogRow) {
                      assignProcedureToWorkInstruction(
                        selectedDialogRow.procedureId,
                        workInstruction.id
                      )
                    }
                  }}
                >
                  {isCreating ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    'Duplicate or import Procedure'
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
        <div className="w-3/5 pl-2">
          <Dialog open={createStepDialog} onOpenChange={setCreateStepDialog}>
            <DialogTrigger asChild>
              <Button>Create Step</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Step</DialogTitle>
                <DialogDescription>Info about creating step</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stepTitle" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="stepTitle"
                    defaultValue=""
                    className="col-span-3"
                    onChange={(e) => setStepTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => createStep(stepTitle)}>
                  {isCreatingStep ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    'Create Step'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {selectedProcedure && selectedProcedure.steps.length > 0 && (
            <DataTableSteps
              setSelectedRow={setSelectedRow}
              columns={columnsSteps}
              data={selectedProcedure.steps}
              isDeletingStep={isDeletingStep}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProceduresPage
