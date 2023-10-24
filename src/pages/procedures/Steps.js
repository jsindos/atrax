import React, { useState } from 'react'
import Tree from '../Tree'
import { useMutation } from '@apollo/client'
import { mutations } from '@/queries'

function buildTree (steps, parentId = null) {
  return steps
    ?.filter(step => step.parentId === parentId)
    .map(step => ({
      ...step,
      id: step.id,
      value: step.title,
      children: buildTree(steps, step.id)
    }))
}

export default ({ procedure }) => {
  const tree = buildTree(procedure?.steps)

  const [nestedSteps, setNestedSteps] = useState(tree)

  const [updateStepIndices, { loading }] = useMutation(
    mutations.UpdateStepIndices
  )

  const onItemsChanged = newItems => {
    setNestedSteps(newItems)
    // need to ensure `parentId` is logged correctly
    console.log(JSON.stringify(newItems, null, 2))
  }

  return (
    <Tree items={nestedSteps} onItemsChanged={onItemsChanged} />
  )
}
