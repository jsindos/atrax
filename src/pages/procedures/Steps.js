import React from 'react'
import Tree from '../Tree'

function buildTree (steps, parentId = null) {
  return steps
    ?.filter(step => step.parentId === parentId)
    .map(step => ({
      id: step.id,
      value: step.title,
      children: buildTree(steps, step.id)
    }))
}

export default ({ procedure }) => {
  const tree = buildTree(procedure?.steps)

  if (!tree) return <div />

  return (
    <Tree data={tree} />
  )
}
