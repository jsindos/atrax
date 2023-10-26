import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import TablePagination, { PAGE_SIZE } from './TablePagination'
import { BackButton } from '../WorkInstructionDetail'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { mutations, queries } from '@/queries'
import { Label } from '@/components/ui/label'
import { saveWithToast } from '@/utils'
import { useToast } from '@/components/ui/use-toast'

export default () => {
  const { id } = useParams()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(id) } })

  const [equipmentAdded, setEquipmentAdded] = useState([])

  useEffect(() => {
    if (workInstruction) {
      setEquipmentAdded(workInstruction?.equipment || [])
    }
  }, [workInstruction])

  const [saveWorkInstructionMutation] = useMutation(mutations.SaveWorkInstruction)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveEquipment = async () => {
    await saveWithToast(
      () => saveWorkInstructionMutation({
        variables: {
          workInstruction: {
            id: Number(id),
            equipmentIds: equipmentAdded.map(e => e.id)
          }
        }
      }),
      toast,
      null,
      setIsSaving
    )
  }

  const navigate = useNavigate()

  return (
    <div className='container mx-auto px-4 pb-8'>
      <div className='flex justify-between row pt-8'>
        <h3>{workInstruction?.title} Equipment</h3>
        <BackButton onClick={() => navigate(`/work_instructions/${id}`)} />
      </div>
      <div className='flex-col flex pt-8'>
        <Button disabled={isSaving} className='self-end flex' onClick={() => saveEquipment()}>
          {
            isSaving
              ? (
                <>
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  Saving
                </>
                )
              : 'Save Changes'
          }
        </Button>
      </div>
      {/* <CreateOrEditEquipment /> */}
      {/* <EquipmentBody {...{ setEquipmentAdded, equipmentAdded, isByCustomer, isByDefaults }} filterByCategory={filterByCategory.id} /> */}
      <EquipmentToAdd />
    </div>
  )
}

const EquipmentToAdd = () => {
  const { id } = useParams()

  const { data: { equipment: initialEquipment } = {} } = useQuery(queries.Equipment)
  const [getWorkInstruction, { data: { workInstruction } = {} }] = useLazyQuery(queries.WorkInstruction)

  useEffect(() => {
    if (id) {
      getWorkInstruction({ variables: { id: Number(id) } })
    }
  }, [])

  const equipment = initialEquipment?.filter(e => e.CMC === workInstruction?.CMC)

  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(equipment?.length / PAGE_SIZE)

  const nextPage = () => {
    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1)
    }
  }

  const previousPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1)
    }
  }

  const canGetNextPage = pageIndex < pageCount - 1
  const canGetPreviousPage = pageIndex > 0

  return (
    <div className='w-full' style={{ display: 'flex', rowGap: '0.75rem', flexDirection: 'column' }}>
      <Label>All Equipment</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MELCode</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            equipment?.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((e, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    {/* <CreateOrEditEquipment id={e.id} /> */}
                  </TableCell>
                  <TableCell>{e.MELCode}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' onClick={() => setEquipmentAdded(ea => [...ea, e])}>
                      <ArrowRightIcon className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
      <TablePagination pageIndex={pageIndex} setPageIndex={setPageIndex} pageCount={pageCount} nextPage={nextPage} previousPage={previousPage} canGetNextPage={canGetNextPage} canGetPreviousPage={canGetPreviousPage} />
    </div>
  )
}
