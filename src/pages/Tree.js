import React from 'react'
import { SortableTree, SimpleTreeItemWrapper } from 'dnd-kit-sortable-tree' // Ensure you have this library installed

export default ({ items, onItemsChanged }) => {
  return (
    <SortableTree
      items={items}
      onItemsChanged={onItemsChanged}
      TreeItemComponent={TreeItem}
    />
  )
}

const TreeItem = React.forwardRef((props, ref) => (
  <SimpleTreeItemWrapper {...props} ref={ref}>
    <div>{props.item.value}</div>
  </SimpleTreeItemWrapper>
))
