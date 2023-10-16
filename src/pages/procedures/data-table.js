import React, { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { mutations } from '@/queries'

// Import necessary modules
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Define the DataTable function
export function DataTable({ columns, data, setSelectedRow }) {
  const sortedData = [...data].sort((a, b) => a.index - b.index)
  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Use the useEffect hook to select the first row after the component has rendered
  useEffect(() => {
    if (table.getRowModel().rows?.length) {
      table.getRowModel().rows[0].toggleSelected(true)
      setSelectedRow(table.getRowModel().rows[0].original)
    }
  }, [table])

  const [updateProcedureIndices, { returned_data, loading, error }] = useMutation(
    mutations.UpdateProcedureIndices
  )

  const onDragEnd = (result) => {
    if (!result.destination) return

    console.log(sortedData)

    const items = Array.from(sortedData)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Create a new array with updated indices
    const updatedItems = items.map((item, index) => {
      const { __typename, ...rest } = item
      return {
        ...rest,
        index: index + 1, // assuming index starts from 1
      }
    })

    console.log(updatedItems)

    updateProcedureIndices({ variables: { procedures: updatedItems } })
  }
  return (
    <div className="rounded-md border">
      {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="table">
            {(provided) => (
              <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <Draggable key={row.id} draggableId={row.id} index={index}>
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          onClick={() => {
                            table.getRowModel().rows.forEach((r) => r.toggleSelected(false)) // Deselect all rows
                            row.toggleSelected(true) // Select the clicked row
                            // HERE how do i get the data associated with this row rather than just row variable
                            setSelectedRow(row.original)
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </div>
  )
}
