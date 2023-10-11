import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export const columns = [
  {
    accessorKey: 'CMC',
    header: 'CMC',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'equipment',
    header: 'Equipment',
  },
  {
    accessorKey: 'system',
    header: 'System',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const workInstruction = row.original
      const navigate = useNavigate()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Work Instruction</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/work_instructions/${workInstruction.id}`)}>
              Edit Work Instruction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/work_instruction/${workInstruction.id}`)}>
              Delete Work Instruction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/work_instruction/${workInstruction.id}`)}>
              Duplicate Work Instruction
            </DropdownMenuItem>
            <DropdownMenuLabel>Procedures</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate(`/work_instructions/${workInstruction.id}/procedures`)}
            >
              Edit Procedures
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
