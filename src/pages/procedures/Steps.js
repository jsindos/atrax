import React, { useState } from 'react'
import Tree from '../Tree'
import { useMutation } from '@apollo/client'
import { mutations } from '@/queries'
import { useToast } from '@/components/ui/use-toast'
import { ReloadIcon } from '@radix-ui/react-icons'

function buildTree (steps, parentId = null) {
  return steps
    .filter(step => step.parentId === parentId)
    .sort((a, b) => a.index - b.index)
    .map(step => ({
      ...step,
      id: step.id,
      value: step.id,
      children: buildTree(steps, step.id)
    }))
}

function flattenTree (tree, parentId = null) {
  let flatSteps = []

  tree.forEach(node => {
    flatSteps.push({
      index: node.index,
      parentId: parentId,
      id: node.id
    })

    if (node.children) {
      flatSteps = flatSteps.concat(flattenTree(node.children, node.id))
    }
  })

  return flatSteps
}

export default ({ procedure }) => {
  const tree = buildTree(procedure.steps)

  const [nestedSteps, setNestedSteps] = useState(tree)

  const [updateStepIndices, { loading }] = useMutation(mutations.UpdateStepIndices)

  const { toast } = useToast()

  const onItemsChanged = async updatedSteps => {
    const oldNestedSteps = nestedSteps
    setNestedSteps(updatedSteps)
    try {
      await updateStepIndices({ variables: { steps: flattenTree(updatedSteps) } })
    } catch (e) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      })
      console.log(e)
      setNestedSteps(oldNestedSteps)
    }
    // console.log('old', JSON.stringify(procedure.steps.map(i => ({ id: i.id, parentId: i.parentId, index: i.index })), null, 2))
    // console.log('new', JSON.stringify(flattenTree(newItems).map(i => ({ id: i.id, parentId: i.parentId, index: i.index })), null, 2))
  }

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
