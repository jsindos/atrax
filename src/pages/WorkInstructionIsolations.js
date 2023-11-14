import { ArrowRightIcon, Cross2Icon, Pencil1Icon, ReloadIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { BackButton, S } from './WorkInstructionDetail'
import { useNavigate, useParams } from 'react-router-dom'
import { mutations, queries } from '@/queries'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Button } from '@/components/ui/button'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import TablePagination, { PAGE_SIZE } from './WorkInstructionWarnings/TablePagination'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { saveWithToast } from '@/utils'
import { Input } from '@/components/ui/input'

export default () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(id) } })

  const [isSaving, setIsSaving] = useState()
  const [isolationsAdded, setIsolationsAdded] = useState([])

  return (
    <div className='container mx-auto px-4 pb-8'>
      <div className='flex justify-between row pt-8'>
        <h3>{workInstruction?.title} Isolations</h3>
        <BackButton onClick={() => navigate(`/work_instructions/${id}`)} />
      </div>
      <div className='flex-col flex pt-8'>
        <Button disabled={isSaving} className='self-end flex' onClick={() => saveWarnings()}>
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
      <CreateOrEditIsolation />
      <Accordion type='single' collapsible className='mt-8'>
        <AccordionItem value='item-1' style={{ borderBottomWidth: 0 }}>
          <AccordionTrigger className='w-full max-w-xs'>Assigned Equipment ({workInstruction?.equipment?.length || 0})</AccordionTrigger>
          <AccordionContent>
            {
              workInstruction?.equipment?.length > 0
                ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>MEL Code</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        workInstruction?.equipment?.map((equipmentItem, i) => (
                          <TableRow key={i}>
                            <TableCell>{equipmentItem.MELCode}</TableCell>
                            <TableCell>{equipmentItem.name}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                  )
                : <p style={{ color: '#999' }}>No assigned equipment</p>
            }
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className='flex w-full space-x-10 pt-8'>
        <IsolationsToAdd {...{ setIsolationsAdded, isolationsAdded }} />
        <IsolationsAdded {...{ setIsolationsAdded, isolationsAdded }} />
      </div>
    </div>
  )
}

const IsolationsToAdd = ({ isolationsAdded, setIsolationsAdded }) => {
  const { id } = useParams()

  const { data: { isolations: initialIsolations } = {} } = useQuery(queries.Isolations)
  const [getWorkInstruction, { data: { workInstruction } = {} }] = useLazyQuery(
    queries.WorkInstruction
  )

  useEffect(() => {
    if (id) {
      getWorkInstruction({ variables: { id: Number(id) } })
    }
  }, [])

  const isolations = initialIsolations?.filter(i =>
    workInstruction?.equipment?.some(equipment =>
      equipment.isolations.some(isolation => isolation.id === i.id)
    )
  )

  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(isolations?.length / PAGE_SIZE)

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
      <Label>All Isolations</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Equipment Name</TableHead>
            <TableHead>UDC</TableHead>
            <TableHead>Compartment</TableHead>
            <TableHead>Isolation Type</TableHead>
            <TableHead>Isolation Device</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            isolations?.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((i, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <CreateOrEditIsolation id={i.id} />
                  </TableCell>
                  <TableCell>{i.equipment?.name}</TableCell>
                  <TableCell>{i.UDC}</TableCell>
                  <TableCell>{i.compartment}</TableCell>
                  <TableCell>{i.isolationType}</TableCell>
                  <TableCell>{i.isolationDevice}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      disabled={isolationsAdded?.find((ia) => ia.id === i.id)}
                      onClick={() => setIsolationsAdded((ia) => [i, ...ia])}
                    >
                      <ArrowRightIcon className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
      <TablePagination
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        pageCount={pageCount}
        nextPage={nextPage}
        previousPage={previousPage}
        canGetNextPage={canGetNextPage}
        canGetPreviousPage={canGetPreviousPage}
      />
    </div>
  )
}

const IsolationsAdded = ({ isolationsAdded, setIsolationsAdded }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(isolationsAdded?.length / PAGE_SIZE)

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
      <Label>Assigned Isolations</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Equipment Name</TableHead>
            <TableHead>UDC</TableHead>
            <TableHead>Compartment</TableHead>
            <TableHead>Isolation Type</TableHead>
            <TableHead>Isolation Device</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            isolationsAdded?.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((i, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <CreateOrEditIsolation id={i.id} />
                  </TableCell>
                  <TableCell>{i.equipment?.name}</TableCell>
                  <TableCell>{i.UDC}</TableCell>
                  <TableCell>{i.compartment}</TableCell>
                  <TableCell>{i.isolationType}</TableCell>
                  <TableCell>{i.isolationDevice}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setIsolationsAdded((ia) => ia.filter((ii) => ii.id !== i.id))}
                    >
                      <Cross2Icon className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
      <TablePagination
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        pageCount={pageCount}
        nextPage={nextPage}
        previousPage={previousPage}
        canGetNextPage={canGetNextPage}
        canGetPreviousPage={canGetPreviousPage}
      />
    </div>
  )
}

const DEFAULT_VALUE = { shortName: 'N/A', longName: 'Not Applicable' }
const DUMMY_SELECT_VALUES = [DEFAULT_VALUE, { shortName: 'T', longName: 'Test' }]

// `id` exists when editing an isolation, but not when creating a new isolation
const CreateOrEditIsolation = ({ id }) => {
  const { id: workInstructionId } = useParams()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, {
    variables: { id: Number(workInstructionId) }
  })
  const { data: { isolations } = {} } = useQuery(queries.Isolations)

  const isolation = isolations?.find((i) => i.id === id)

  const [isolationDevice, setIsolationDevice] = useState('')

  const [UDC, setUDC] = useState(DEFAULT_VALUE)
  const [compartment, setCompartment] = useState(DEFAULT_VALUE)
  const [isolationType, setIsolationType] = useState(DEFAULT_VALUE)

  const [selectedEquipment, setSelectedEquipment] = useState()

  useEffect(() => {
    if (isolation) {
      setIsolationDevice(isolation.isolationDevice)

      setUDC(DUMMY_SELECT_VALUES.find(item => item.longName === isolation.UDC) || DEFAULT_VALUE)
      setCompartment(DUMMY_SELECT_VALUES.find(item => item.longName === isolation.compartment) || DEFAULT_VALUE)
      setIsolationType(DUMMY_SELECT_VALUES.find(item => item.longName === isolation.isolationType) || DEFAULT_VALUE)

      setSelectedEquipment({ shortName: isolation.equipment?.id, longName: isolation.equipment?.name })
    }
  }, [isolation])

  const [createIsolationMutation] = useMutation(mutations.CreateIsolation)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const createIsolation = async () => {
    if (!selectedEquipment) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Please select an equipment.'
      })
      return
    }
    await saveWithToast(
      () =>
        createIsolationMutation({
          variables: {
            isolation: {
              isolationDevice,

              UDC: UDC.longName,
              compartment: compartment.longName,
              isolationType: isolationType.longName
            },
            equipmentId: selectedEquipment.shortName
          },
          update (cache, { data: { createIsolation: isolation } }) {
            cache.modify({
              fields: {
                isolations (existingIsolation = []) {
                  const newIsolationRef = cache.writeFragment({
                    data: isolation,
                    fragment: gql`
                      fragment NewIsolation on Isolation {
                        id
                      }
                    `
                  })
                  return [...existingIsolation, newIsolationRef]
                }
              }
            })
          }
        }),
      toast,
      'Isolation created',
      setIsSaving
    )
    setUDC('')
    setCompartment('')
    setIsolationType('')
    setIsolationDevice('')
    setShowDialog(false)
  }

  const [saveIsolationMutation] = useMutation(mutations.SaveIsolation)

  const saveIsolation = async () => {
    await saveWithToast(
      () =>
        saveIsolationMutation({
          variables: {
            isolation: {
              id,
              isolationDevice,

              UDC: UDC.longName,
              compartment: compartment.longName,
              isolationType: isolationType.longName
            }
          }
        }),
      toast,
      'Isolation saved',
      setIsSaving
    )
    setShowDialog(false)
  }

  const [showDialog, setShowDialog] = useState(false)

  const isDisabled = !(workInstruction?.equipment?.length > 0)

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
              <Button className='self-end flex max-w-sm mt-4'>Create new isolation</Button>
              )
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{id ? 'Edit Isolation' : 'Create Isolation'}</DialogTitle>
          {
            isDisabled && (
              <p style={{ fontSize: 14 }}>Equipment must be assigned to this work instruction before isolations can be created.</p>
            )
          }
          <S
            isDisabled={isDisabled || id}
            className='pt-6'
            currentValue={selectedEquipment}
            handleSelectChange={shortName => setSelectedEquipment({ shortName, longName: workInstruction?.equipment.find(e => e.id === shortName).name })}
            values={workInstruction?.equipment?.map(e => ({ shortName: e.id, longName: e.name }))}
            nameKey='longName'
            valueKey='shortName'
            placeholder='Select...'
            label='Equipment'
          />
          <S
            className='pt-6'
            currentValue={UDC}
            handleSelectChange={shortName => setUDC(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
            values={DUMMY_SELECT_VALUES}
            nameKey='longName'
            valueKey='shortName'
            placeholder='Select...'
            label='UDC'
          />
          <S
            className='pt-6'
            currentValue={compartment}
            handleSelectChange={shortName => setCompartment(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
            values={DUMMY_SELECT_VALUES}
            nameKey='longName'
            valueKey='shortName'
            placeholder='Select...'
            label='Compartment'
          />
          <S
            className='pt-6'
            currentValue={isolationType}
            handleSelectChange={shortName => setIsolationType(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
            values={DUMMY_SELECT_VALUES}
            nameKey='longName'
            valueKey='shortName'
            placeholder='Select...'
            label='Isolation Type'
          />
          <div className='pt-6'>
            <div className='grid w-full items-center gap-3'>
              <Label>Isolation Device</Label>
              <Input value={isolationDevice} onChange={(e) => setIsolationDevice(e.target.value)} />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className='flex-col flex pt-8'>
            <Button
              disabled={isSaving || isDisabled}
              className='self-end flex'
              onClick={() => (id ? saveIsolation() : createIsolation())}
            >
              {
                isSaving
                  ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      {id ? 'Saving' : 'Creating'}
                    </>
                    )
                  : id
                    ? (
                        'Save changes'
                      )
                    : (
                        'Create'
                      )
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
