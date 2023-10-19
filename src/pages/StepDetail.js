import React, { useEffect, useState } from 'react'
import { BackButton } from './WorkInstructionDetail'
import { Pencil1Icon, ReloadIcon } from '@radix-ui/react-icons'
import { mutations, queries } from '@/queries'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { saveWithToast } from '@/utils'

export default () => {
  const { workInstructionId, stepId } = useParams()

  const { data: { step } = {}, loading } = useQuery(queries.Step, { variables: { id: Number(stepId) } })

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

  return (
    <div className='container mx-auto px-4'>
      <div className='flex justify-between row pt-8'>
        <h3>Update Step</h3>
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
              <Textarea className='mt-8' style={{ minHeight: 100 }} value={content} onChange={(e) => setContent(e.target.value)} />
              <Button className='mt-8' onClick={() => navigate(`/work_instructions/${workInstructionId}/steps/${stepId}/warnings`)}>
                Warnings, Cautions and Notes
              </Button>
              <Tabs defaultValue='children' className='mt-8'>
                <TabsList>
                  <TabsTrigger value='children'>Child Steps</TabsTrigger>
                  <TabsTrigger value='password'>Images</TabsTrigger>
                </TabsList>
                <TabsContent value='children' className='mt-8'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Step Text</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        step.childSteps.map((c, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell>{c.title}</TableCell>
                              <TableCell className='flex justify-end'>
                                <EditChildStepDialog childStep={c} />
                              </TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>

                </TabsContent>
                <TabsContent className='mt-8' value='password'>Upload your images here.</TabsContent>
              </Tabs>

            </>
            )
      }
    </div>
  )
}

const EditChildStepDialog = ({ childStep, children }) => {
  const [saveChildStepMutation] = useMutation(mutations.SaveChildStep)

  const mutation = title => (
    saveChildStepMutation({
      variables: {
        childStep: {
          id: childStep.id,
          title
        }
      }
    })
  )

  return <EditTextDialog initialText={childStep.title} mutation={mutation} />
}

export const EditTextDialog = ({ initialText, mutation }) => {
  const [text, setText] = useState('')

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  const save = () => saveWithToast(
    () => mutation(text),
    toast,
    null,
    setIsSaving
  )

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant='outline' size='icon'>
          <Pencil1Icon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='Dialog'>
        <DialogHeader>
          <DialogTitle>Edit text</DialogTitle>
          <Textarea className='mt-8' style={{ minHeight: 100 }} value={text} onChange={(e) => setText(e.target.value)} />
        </DialogHeader>
        <DialogFooter>
          <div className='flex-col flex pt-8'>
            <Button disabled={isSaving} className='self-end flex' onClick={() => save()}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
