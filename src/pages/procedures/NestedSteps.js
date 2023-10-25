import React, { useEffect, useState } from 'react'
import Tree from '../Tree'
import { useMutation } from '@apollo/client'
import { mutations } from '@/queries'
import { useToast } from '@/components/ui/use-toast'
import { ReloadIcon } from '@radix-ui/react-icons'
import { buildTree, flattenTree } from '@/utils'

export default ({ steps, parentId = null }) => {
  const tree = buildTree(steps, parentId)

  useEffect(() => {
    // must compare to `tree` instead of `steps`, as `tree` is pruned with `parentId` in `buildTree(steps, parentId)` (used in StepDetail)
    if (flattenTree(tree).length !== flattenTree(nestedSteps).length) {
      const tree = buildTree(steps, parentId)
      setNestedSteps(tree)
    }
  }, [tree])

  const [nestedSteps, setNestedSteps] = useState(tree)

  const [updateStepIndices, { loading }] = useMutation(mutations.UpdateStepIndices)

  const { toast } = useToast()

  const onItemsChanged = async updatedSteps => {
    const oldNestedSteps = nestedSteps
    setNestedSteps(updatedSteps)

    // console.log('old', JSON.stringify(steps.map(i => ({ id: i.id, parentId: i.parentId, index: i.index })), null, 2))
    // console.log('new', JSON.stringify(flattenTree(updatedSteps).map(i => ({ id: i.id, parentId: i.parentId, index: i.index })), null, 2))

    try {
      await updateStepIndices({ variables: { steps: flattenTree(updatedSteps, parentId) } })
    } catch (e) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      })
      console.log(e)
      setNestedSteps(oldNestedSteps)
    }
    // console.log('old', JSON.stringify(steps.map(i => ({ id: i.id, parentId: i.parentId, index: i.index })), null, 2))
    // console.log('new', JSON.stringify(flattenTree(tree).map(i => ({ id: i.id, parentId: i.parentId, index: i.index })), null, 2))
  }

  console.log('nestedSteps', nestedSteps)

  return (
    <div className='pt-8 flex row'>
      <div className='w-full'>
        <Tree items={nestedSteps} onItemsChanged={onItemsChanged} />
      </div>
      {
        loading ? <ReloadIcon className='ml-2 mt-2 h-4 w-4 animate-spin' /> : <div className='ml-2' style={{ width: 15 }} />
      }
    </div>
  )
}
