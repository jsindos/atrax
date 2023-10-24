import React, { useState } from 'react'
import { SortableTree, SimpleTreeItemWrapper, TreeItems } from 'dnd-kit-sortable-tree' // Ensure you have this library installed

export default () => {
  const [items, setItems] = useState(initialTreeData)

  return (
    <SortableTree
      items={items}
      onItemsChanged={setItems}
      TreeItemComponent={TreeItem}
    />
  )
}

const TreeItem = React.forwardRef((props, ref) => (
  <SimpleTreeItemWrapper {...props} ref={ref}>
    <div>{props.item.value}</div>
  </SimpleTreeItemWrapper>
))

const initialTreeData = [
  {
    id: '1',
    value: 'First parent',
    children: [
      { id: '1.1', value: 'Child one' },
      { id: '1.2', value: 'Child two' }
    ]
  },
  {
    id: '2',
    value: 'Second parent',
    children: [
      { id: '2.1', value: 'Child three' },
      { id: '2.2', value: 'Child four' }
    ]
  }
]
