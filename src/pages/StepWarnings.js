import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { mutations, queries } from '@/queries'
import { saveWithToast } from '@/utils'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from './WorkInstructionDetail'
import { Button } from '@/components/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { WarningsBody } from './WorkInstructionWarnings/WorkInstructionWarnings'

export default () => {
  const { workInstructionId, procedureId, stepId } = useParams()

  const { data: { step } = {} } = useQuery(queries.Step, { variables: { id: Number(stepId) } })

  const [warningsAdded, setWarningsAdded] = useState([])

  useEffect(() => {
    if (step) {
      setWarningsAdded(step?.warnings || [])
    }
  }, [step])

  const [saveStepMutation] = useMutation(mutations.SaveStep)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveWarnings = async () => {
    await saveWithToast(
      () => saveStepMutation({
        variables: {
          step: {
            id: Number(stepId),
            warningIds: warningsAdded.map(w => w.id)
          }
        }
      }),
      toast,
      null,
      setIsSaving
    )
  }

  const navigate = useNavigate()

  return (
    <div className='container mx-auto px-4 pb-8'>
      <div className='flex justify-between row pt-8'>
        <h3>Assign Warnings, Cautions and Notes to Step</h3>
        <BackButton onClick={() => navigate(`/work_instructions/${workInstructionId}/procedures/${procedureId}/steps/${stepId}`)} />
      </div>
      <div className='flex-col flex pt-8'>
        <Button disabled={isSaving} className='self-end flex' onClick={() => saveWarnings()}>
          {
            isSaving
              ? (
                <>
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  Saving
                </>
                )
              : 'Save Changes'
          }
        </Button>
      </div>
      <WarningsBody {...{ setWarningsAdded, warningsAdded }} isByWorkInstruction />
    </div>
  )
}
