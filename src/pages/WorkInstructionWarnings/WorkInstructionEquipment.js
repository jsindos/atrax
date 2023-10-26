import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import TablePagination, { PAGE_SIZE } from './TablePagination'
import { BackButton } from '../WorkInstructionDetail'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, Cross2Icon, Pencil1Icon, ReloadIcon } from '@radix-ui/react-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { mutations, queries } from '@/queries'
import { Label } from '@/components/ui/label'
import { saveWithToast } from '@/utils'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'

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
      <CreateOrEditEquipment />
      <div className='pt-8'>
        <div className='grid items-center gap-3 max-w-sm'>
          <Label>CMC</Label>
          <Input value={workInstruction?.CMC?.code} readOnly />
        </div>
      </div>
      <div className='flex w-full space-x-10 pt-8'>
        <EquipmentToAdd {...{ setEquipmentAdded, equipmentAdded }} />
        <EquipmentAdded {...{ setEquipmentAdded, equipmentAdded }} />
      </div>
    </div>
  )
}

const EquipmentToAdd = ({ equipmentAdded, setEquipmentAdded }) => {
  const { id } = useParams()

  const { data: { equipment: initialEquipment } = {} } = useQuery(queries.Equipment)
  const [getWorkInstruction, { data: { workInstruction } = {} }] = useLazyQuery(queries.WorkInstruction)

  useEffect(() => {
    if (id) {
      getWorkInstruction({ variables: { id: Number(id) } })
    }
  }, [])

  const equipment = initialEquipment?.filter(e => e.CMC?.id === workInstruction?.CMC.id)

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
            <TableHead />
            <TableHead>MEL Code</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            equipment?.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((e, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    <CreateOrEditEquipment id={e.id} />
                  </TableCell>
                  <TableCell>{e.MELCode}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' disabled={equipmentAdded?.find(ea => ea.id === e.id)} onClick={() => setEquipmentAdded(ea => [e, ...ea])}>

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

const EquipmentAdded = ({ equipmentAdded, setEquipmentAdded }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(equipmentAdded?.length / PAGE_SIZE)

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
      <Label>Assigned Equipment</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>MEL Code</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            equipmentAdded?.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((e, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    <CreateOrEditEquipment id={e.id} />
                  </TableCell>
                  <TableCell>{e.MELCode}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' onClick={() => setEquipmentAdded(ea => ea.filter(ee => ee.id !== e.id))}>
                      <Cross2Icon className='h-4 w-4' />
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

// `id` exists when editing a piece of equipment, but not when creating a new piece of equipment
const CreateOrEditEquipment = ({ id }) => {
  const { id: workInstructionId } = useParams()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(workInstructionId) } })
  const { data: { equipment } = {} } = useQuery(queries.Equipment)

  const equipmentItem = equipment?.find(e => e.id === id)

  const [MELCode, setMELCode] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (equipmentItem) {
      setMELCode(equipmentItem.MELCode)
      setName(equipmentItem.name)
    }
  }, [equipmentItem])

  const [createEquipmentMutation] = useMutation(mutations.CreateEquipment)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const createEquipment = async () => {
    await saveWithToast(
      () => createEquipmentMutation({
        variables: {
          equipment: {
            MELCode,
            name
          },
          workInstructionId: workInstruction.id
        },
        update (cache, { data: { createEquipment: equipment } }) {
          cache.modify({
            fields: {
              equipment (existingEquipment = []) {
                const newEquipmentRef = cache.writeFragment({
                  data: equipment,
                  fragment: gql`
                    fragment NewEquipment on Equipment {
                      id
                    }
                  `
                })
                return [...existingEquipment, newEquipmentRef]
              }
            }
          })
        }
      }),
      toast,
      'Equipment created',
      setIsSaving
    )
    setMELCode('')
    setName('')
    setShowDialog(false)
  }

  const [saveEquipmentMutation] = useMutation(mutations.SaveEquipment)

  const saveEquipment = async () => {
    await saveWithToast(
      () => saveEquipmentMutation({
        variables: {
          equipment: {
            id,
            MELCode,
            name
          }
        }
      }),
      toast,
      'Equipment saved',
      setIsSaving
    )
    setShowDialog(false)
  }

  const [showDialog, setShowDialog] = useState(false)

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger>
        {
          id
            ? (
              <Button variant='ghost' size='icon'>
                <Pencil1Icon className='h-4 w-4' />
              </Button>
              )
            : (
              <Button className='self-end flex max-w-sm mt-4'>
                Create new
              </Button>
              )
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{id ? 'Edit Equipment' : 'Create Equipment'}</DialogTitle>
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>CMC</Label>
              <Input value={workInstruction?.CMC?.code} readOnly />
            </div>
          </div>
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>MEL Code</Label>
              <Input value={MELCode} onChange={(e) => setMELCode(e.target.value)} />
            </div>
          </div>
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className='flex-col flex pt-8'>
            <Button disabled={isSaving} className='self-end flex' onClick={() => id ? saveEquipment() : createEquipment()}>
              {
                isSaving
                  ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      {id ? 'Saving' : 'Creating'}
                    </>
                    )
                  : (
                      id ? 'Save changes' : 'Create'
                    )
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
