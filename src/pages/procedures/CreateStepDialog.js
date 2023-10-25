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

export default ({ isChild, procedureId, parentId, dialogTriggerClassName }) => {
  const { toast } = useToast()

  const [createStepMutation] = useMutation(mutations.CreateStep)

  const [isCreatingStep, setIsCreatingStep] = useState()
  const [stepTitle, setStepTitle] = useState('')
  const [createStepDialog, setCreateStepDialog] = useState()

  const createStep = async (stepTitle) => {
    const stepInput = {
      title: stepTitle,
      parentId,
      procedureId
    }

    setIsCreatingStep(true)
    await saveWithToast(
      () =>
        createStepMutation({
          variables: {
            step: stepInput
          }
        }),
      toast,
      'Step Created',
      setIsCreatingStep
    )
    setCreateStepDialog(false)
  }
  return (
    <Dialog open={createStepDialog} onOpenChange={setCreateStepDialog}>
      <DialogTrigger asChild>
        <Button className={dialogTriggerClassName}>Create {isChild ? 'Child ' : ''}Step</Button>
      </DialogTrigger>
      <DialogContent className='Dialog'>
        <DialogHeader>
          <DialogTitle>Create {isChild ? 'Child ' : ''}Step</DialogTitle>
        </DialogHeader>
        <Textarea
          className='mt-8'
          style={{ minHeight: 150 }}
          value={stepTitle}
          onChange={(e) => setStepTitle(e.target.value)}
        />
        <DialogFooter>
          <Button type='submit' onClick={() => createStep(stepTitle)}>
            {
            isCreatingStep
              ? (
                <>
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  Creating
                </>
                )
              : (
                  'Create Step'
                )
          }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
