import React, { useState } from 'react'
import { SortableTree, SimpleTreeItemWrapper } from 'dnd-kit-sortable-tree'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { useToast } from '@/components/ui/use-toast'
import { saveWithToast } from '@/utils'
import { mutations } from '@/queries'
import { ReloadIcon } from '@radix-ui/react-icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export default ({ items, onItemsChanged }) => {
  return (
    <SortableTree
      items={items}
      onItemsChanged={onItemsChanged}
      TreeItemComponent={TreeItem}
    />
  )
}

const TreeItem = React.forwardRef((props, ref) => {
  const { workInstructionId, procedureId } = useParams()
  const navigate = useNavigate()

  const [isDeletingStep, setIsDeletingStep] = useState()

  const [deleteStepMutation] = useMutation(mutations.DeleteStep)

  const { toast } = useToast()

  const deleteStep = async id => {
    setIsDeletingStep(true)
    await saveWithToast(
      () =>
        deleteStepMutation({
          variables: {
            id
          },
          update: (cache) => {
            cache.modify({
              fields: {
                procedures: (existingProcedures = []) => {
                  return existingProcedures.map(procedure => {
                    const newSteps = procedure.steps?.filter(step => step.id !== id)
                    return { ...procedure, steps: newSteps }
                  })
                }
              }
            })
          }
        }),
      toast,
      'Step Deleted',
      setIsDeletingStep
    )
  }

  const [showDialog, setShowDialog] = useState()

  return (
    <SimpleTreeItemWrapper {...props} ref={ref}>
      <div>{props.item.value}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' style={{ minWidth: 32, marginLeft: 'auto' }}>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => navigate(`/work_instructions/${workInstructionId}/procedures/${procedureId || props.item.procedureId}/steps/${props.item.id}`)}
          >
            Edit Step
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => props.item.children?.length ? setShowDialog(true) : deleteStep(props.item.id)}>
            {
              isDeletingStep
                ? (
                  <>
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                    Deleting
                  </>
                  )
                : (
                    'Delete Step'
                  )
            }
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete step</DialogTitle>
            <DialogDescription>
              Deleting this step will delete all of its child steps. Are you sure you wish to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => deleteStep(props.item.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SimpleTreeItemWrapper>
  )
})
