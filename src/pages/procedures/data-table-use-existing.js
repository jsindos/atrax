import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

export function DataTableUseExisting({ columns, data, setSelectedDialogRow }) {
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [columnFilters, setColumnFilters] = useState([])

  const modifiedColumns = columns.map((column) => {
    if (column.id === 'select') {
      return {
        ...column,
        cell: ({ row }) => (
          <Checkbox
            checked={row.id === selectedRowId}
            onCheckedChange={(value) => {
              setSelectedRowId(value ? row.id : null)
              setSelectedDialogRow(row.original)
              console.log(row.original)
            }}
            aria-label="Select row"
          />
        ),
      }
    }
    return column
  })

  const table = useReactTable({
    data,
    columns: modifiedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by customer..."
          value={table.getColumn('customerName')?.getFilterValue() ?? ''}
          onChange={(event) => table.getColumn('customerName')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by procedure title..."
          value={table.getColumn('procedureTitle')?.getFilterValue() ?? ''}
          onChange={(event) =>
            table.getColumn('procedureTitle')?.setFilterValue(event.target.value)
          }
          className="max-w-sm ml-4"
        />
      </div>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
    </div>
  )
}
