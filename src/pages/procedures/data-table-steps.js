import React from 'react'
import { useMutation } from '@apollo/client'

import { mutations } from '@/queries'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ReloadIcon } from '@radix-ui/react-icons'

export function DataTableSteps ({ columns, data }) {
  const sortedData = [...data].sort((a, b) => a.index - b.index)

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const [updateStepIndices, { loading }] = useMutation(
    mutations.UpdateStepIndices
  )

  const onDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(sortedData)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Create a new array with updated indices
    const updatedItems = items.map((item, index) => {
      const { __typename, ...rest } = item
      return {
        ...rest,
        index: index + 1 // assuming index starts from 1
      }
    })

    updateStepIndices({ variables: { steps: updatedItems } })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='rounded-md border'>
        <Droppable droppableId='table'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
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
                <TableBody>
                  {table.getRowModel().rows?.length
                    ? (
                        table.getRowModel().rows.map((row, index) => (
                          <Draggable key={row.id} draggableId={row.id} index={index}>
                            {(provided) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
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
                      )
                    : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                          No results.
                        </TableCell>
                      </TableRow>
                      )}
                </TableBody>
              </Table>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}
