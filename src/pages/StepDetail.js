import React, { useEffect, useRef, useState } from 'react'
import { BackButton, I } from './WorkInstructionDetail'
import { PaperPlaneIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons'
import { mutations, queries } from '@/queries'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildTree, saveWithToast } from '@/utils'
import NestedSteps from './procedures/NestedSteps'
import CreateStepDialog from './procedures/CreateStepDialog'
import Inspection from './steps/Inspection'
import CreateOrEditInspectionDialog from './procedures/CreateOrEditInspectionDialog'

export default () => {
  const { workInstructionId, procedureId, stepId } = useParams()

  const { data: { procedures } = {} } = useQuery(queries.Procedures)
  const { data: { step } = {}, loading } = useQuery(queries.Step, { variables: { id: Number(stepId) } })

  const procedure = procedures?.find(p => p.id === Number(procedureId))

  const childSteps = buildTree(procedure?.steps, step?.id)

  const [content, setContent] = useState('')

  useEffect(() => {
    if (step) {
      setContent(step.title)
    }
  }, [step])

  const [saveStepMutation] = useMutation(mutations.SaveStep)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveStep = () => saveWithToast(
    () => saveStepMutation({
      variables: {
        step: {
          id: step.id,
          title: content
        }
      }
    }),
    toast,
    null,
    setIsSaving
  )

  const navigate = useNavigate()

  const fileInput1 = useRef(null)

  const [createStepImageMutation, { loading: isUploadingImage }] = useMutation(mutations.CreateStepImage)

  const handleSubmit = async (e) => {
    const file = fileInput1.current.files[0]
    if (!file) return

    try {
      await createStepImageMutation({
        variables: {
          stepId: Number(stepId),
          image: file
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  const [deleteStepImageMutation, { loading: isDeletingImage }] = useMutation(mutations.DeleteStepImage)
  const [deletingImageId, setDeletingImageId] = useState()

  const handleDelete = async (imageId) => {
    setDeletingImageId(imageId)
    try {
      await deleteStepImageMutation({
        variables: {
          imageId
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingImageId()
    }
  }

  return (
    <div className='container mx-auto px-4'>
      <div className='flex justify-between row pt-8'>
        <h3>Edit Step</h3>
        <BackButton onClick={() => navigate(`/work_instructions/${workInstructionId}/procedures`)} />
      </div>
      {
        loading
          ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
          : (
            <>
              <div className='flex-col flex pt-8'>
                <Button disabled={isSaving} className='self-end flex' onClick={() => saveStep()}>
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
              <Textarea className='mt-8' style={{ minHeight: 150 }} value={content} onChange={(e) => setContent(e.target.value)} />
              <Button className='mt-8' onClick={() => navigate(`/work_instructions/${workInstructionId}/procedures/${procedureId}/steps/${stepId}/warnings`)}>
                <PaperPlaneIcon className='mr-2' />
                Warnings, Cautions and Notes ({step?.warnings.length || 0})
              </Button>
              <Tabs defaultValue='steps' className='mt-8'>
                <TabsList>
                  <TabsTrigger value='steps'>Child Steps</TabsTrigger>
                  <TabsTrigger value='images'>Images</TabsTrigger>
                  <TabsTrigger value='inspections'>Inspection/Test</TabsTrigger>
                </TabsList>
                <TabsContent value='steps'>
                  <CreateStepDialog isChild parentId={Number(stepId)} procedureId={Number(procedureId)} dialogTriggerClassName='mt-6' />
                  {
                    childSteps?.length > 0
                      ? <NestedSteps steps={procedure.steps} parentId={step?.id} />
                      : <p className='mt-8' style={{ color: '#999' }}>No child steps yet</p>
                  }
                </TabsContent>
                <TabsContent value='images'>
                  <I label='Upload image' type='file' name='upload1' ref={fileInput1} />
                  <Button disabled={isUploadingImage} className='mt-8' onClick={handleSubmit}>
                    {
                      isUploadingImage
                        ? (
                          <>
                            <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                            Uploading...
                          </>
                          )
                        : 'Upload'
                    }
                  </Button>
                  <div className='flex flex-row space-x-4 mt-8'>
                    {
                      step.images.map((image, i) => {
                        return (
                          <div key={i} className='relative'>
                            <img src={image.uri} alt={`Step image ${i}`} style={{ maxWidth: '325px' }} />
                            <div className='absolute top-2 right-2'>
                              {
                                isDeletingImage && deletingImageId === image.id
                                  ? (
                                    <Button variant='outline' size='icon' disabled>
                                      <ReloadIcon className='h-4 w-4 animate-spin' />
                                    </Button>
                                    )
                                  : (
                                    <Button variant='outline' size='icon' onClick={() => handleDelete(image.id)}>
                                      <TrashIcon className='h-4 w-4' />
                                    </Button>
                                    )
                              }
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </TabsContent>
                <TabsContent value='inspections'>
                  <CreateOrEditInspectionDialog dialogTriggerClassName='mt-6 mb-8' />
                  {
                    step?.inspections?.length > 0
                      ? step.inspections.map((inspection, i) => <Inspection key={i} inspection={inspection} className='mb-8' />)
                      : <p style={{ color: '#999' }}>No inspections yet</p>
                  }
                </TabsContent>
              </Tabs>

            </>
            )
      }
    </div>
  )
}
