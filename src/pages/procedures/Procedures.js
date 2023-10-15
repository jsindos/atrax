import React from 'react'
import { saveWithToast } from '@/utils'
import { DataTable } from './data-table'
import { DataTableSteps } from './data-table-steps'
import { columns, columnsSteps } from './columns'
import { useQuery } from '@apollo/client'
import { queries, mutations } from '@/queries'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '@/components/ui/use-toast'

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
import { Slack } from 'lucide-react'

const ProceduresPage = () => {
  const { id } = useParams()
  const { data: { workInstruction } = {}, loading } = useQuery(queries.WorkInstruction, {
    variables: { id: Number(id) },
  })

  const [selectedRow, setSelectedRow] = useState(null)
  const { toast } = useToast()

  let procedures = workInstruction?.procedures.map((item) => {
    let procedure = { ...item.procedure }
    return procedure
  })

  let selectedProcedure

  if (procedures && selectedRow) {
    selectedProcedure = procedures.find((procedure) => procedure.id === selectedRow.id)
  }

  const [createProcedureDialog, setCreateProcedureDialog] = useState()
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

  if (workInstruction && workInstruction.procedures.length === 0) {
    // return 'No procedures for this work instruction yet ...'
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

          {procedures && procedures.length > 0 && (
            <DataTable setSelectedRow={setSelectedRow} columns={columns} data={procedures} />
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
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProceduresPage
