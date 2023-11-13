import { useToast } from '@/components/ui/use-toast'
import { mutations } from '@/queries'
import { saveWithToast } from '@/utils'
import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Label } from '@/components/ui/label'

export default ({ isChild, procedureId, parentId, dialogTriggerClassName }) => {
  const { toast } = useToast()

  // const [createInspectionMutation] = useMutation(mutations.CreateInspection)

  const [isCreatingInspection, setIsCreatingInspection] = useState()
  const [inspectionTitle, setInspectionTitle] = useState('')
  const [createInspectionDialog, setCreateInspectionDialog] = useState()

  const createInspection = async (inspectionTitle) => {
    const inspectionInput = {
      title: inspectionTitle,
      parentId,
      procedureId
    }

    setIsCreatingInspection(true)
    await saveWithToast(
      () =>
        createInspectionMutation({
          variables: {
            inspection: inspectionInput
          }
        }),
      toast,
      'Inspection Created',
      setIsCreatingInspection
    )
    setCreateInspectionDialog(false)
  }
  return (
    <Dialog open={createInspectionDialog} onOpenChange={setCreateInspectionDialog}>
      <DialogTrigger asChild>
        <Button className={dialogTriggerClassName}>Create New Inspection or Test</Button>
      </DialogTrigger>
      <DialogContent className='Dialog'>
        <DialogHeader>
          <DialogTitle>New Inspection or Test</DialogTitle>
        </DialogHeader>
        <div className='flex flex-row justify-between'>
          <div className='w-full max-w-lg'>
            <div className='flex-col gap-3 flex'>
              <Label>Inspection/Test Activity</Label>
              <Textarea
                style={{ minHeight: 150 }}
                value={inspectionTitle}
                onChange={(e) => setInspectionTitle(e.target.value)}
              />
            </div>
            <div className='flex-col gap-3 flex mt-8'>
              <Label>Inspection/Test Criteria</Label>
              <Textarea
                style={{ minHeight: 150 }}
                value={inspectionTitle}
                onChange={(e) => setInspectionTitle(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-col w-full max-w-sm'>
            <h6>
              Inspection requirements
            </h6>
            <p>
              Requires hardcoded dropdowns
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={() => createInspection(inspectionTitle)}>
            {
              isCreatingInspection
                ? (
                  <>
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                    Creating
                  </>
                  )
                : (
                    'Create'
                  )
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
