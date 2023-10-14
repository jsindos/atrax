import React, { useEffect, useState } from 'react'

// Import necessary modules
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Use the useEffect hook to select the first row after the component has rendered
  useEffect(() => {
    if (table.getRowModel().rows?.length) {
      table.getRowModel().rows[0].toggleSelected(true)
      setSelectedRow(table.getRowModel().rows[0])
    }
  }, [table])

  return (
    <div className="rounded-md border">
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              // Add an onClick event to the TableRow that toggles the selection of the row and updates the selectedRow state
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => {
                  table.getRowModel().rows.forEach((r) => r.toggleSelected(false)) // Deselect all rows
                  row.toggleSelected(true) // Select the clicked row
                  setSelectedRow(row)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
