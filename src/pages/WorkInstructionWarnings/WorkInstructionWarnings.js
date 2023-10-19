import { Label } from '@/components/ui/label'
import { mutations, queries } from '@/queries'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { gql, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, Cross2Icon, Pencil1Icon, ReloadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/ui/use-toast'
import { saveWithToast } from '@/utils'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { BackButton, S } from '../WorkInstructionDetail'
import WarningsTablePagination from './WarningsTablePagination'

export default () => {
  const { id } = useParams()

  const { data: { warnings } = {} } = useQuery(queries.Warnings)
  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(id) } })

  const [warningsAdded, setWarningsAdded] = useState()

  useEffect(() => {
    if (warningsAdded?.length) {
      setWarningsAdded(warningsAdded.map(w => warnings.find(ww => ww.id === w.id)))
    } else {
      setWarningsAdded(workInstruction?.warnings || [])
    }
  }, [warnings])

  const [saveWorkInstructionMutation] = useMutation(mutations.SaveWorkInstruction)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveWarnings = async () => {
    await saveWithToast(
      () => saveWorkInstructionMutation({
        variables: {
          workInstruction: {
            id: Number(id),
            warningIds: warningsAdded.map(w => w.id)
          }
        }
      }),
      toast,
      null,
      setIsSaving
    )
    setShowDialog(false)
  }

  const navigate = useNavigate()

  const [showDialog, setShowDialog] = useState(false)

  return (
    <div className='container mx-auto px-4 pb-8'>
      <div className='flex justify-between row pt-8'>
        <h3>{workInstruction?.title} Warnings, Cautions and Notes</h3>
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
      <WarningsBody {...{ setWarningsAdded, warningsAdded }} />
    </div>
  // <Dialog open={showDialog} onOpenChange={setShowDialog}>
  //   <DialogTrigger className='pt-8'>
  //     <Button>
  //       Warnings, Cautions and Notes
  //     </Button>
  //   </DialogTrigger>
  //   <DialogContent className='Dialog'>
  //     <DialogHeader>
  //       <DialogTitle>{workInstruction.title} Warnings, Cautions and Notes</DialogTitle>

  //       <WarningsBody {...{ setWarningsAdded, warningsAdded }} />
  //     </DialogHeader>
  //     <DialogFooter>
  //       <div className='flex-col flex pt-8'>
  //         <Button disabled={isSaving} className='self-end flex' onClick={() => saveWarnings()}>
  //           {
  //             isSaving
  //               ? (
  //                 <>
  //                   <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
  //                   Saving
  //                 </>
  //                 )
  //               : 'Save Changes'
  //           }
  //         </Button>
  //       </div>
  //     </DialogFooter>
  //   </DialogContent>
  // </Dialog>
  )
}

const WarningsBody = ({ setWarningsAdded, warningsAdded }) => {
  // one of 'warning', 'caution', 'note'
  const [tab, setTab] = useState('warning')

  const [isByCustomer, setIsByCustomer] = useState(false)
  const [isByDefaults, setIsByDefaults] = useState(false)

  return (
    <>
      <CreateNewWarning />
      <div className='flex items-center row space-x-4 pt-8 pb-8'>
        <div className='flex items-center space-x-2'>
          <Switch checked={isByCustomer} onCheckedChange={setIsByCustomer} />
          <Label>Limit to customer</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Switch checked={isByDefaults} onCheckedChange={setIsByDefaults} id='airplane-mode' />
          <Label htmlFor='airplane-mode'>Limit to defaults</Label>
        </div>
      </div>
      <Tabs value={tab} onValueChange={v => setTab(v)} className='w-full'>
        <TabsList>
          <TabsTrigger value='warning'>Warnings</TabsTrigger>
          <TabsTrigger value='caution'>Cautions</TabsTrigger>
          <TabsTrigger value='note'>Notes</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className='flex w-full space-x-10 pt-8'>
        <WarningsToAdd {...{ setWarningsAdded, warningsAdded, isByCustomer, isByDefaults }} typeSelected={tab} />
        <WarningsAdded warnings={warningsAdded} {...{ setWarningsAdded }} typeSelected={tab} />
      </div>
    </>
  )
}

const PAGE_SIZE = 8

const WarningsToAdd = ({ setWarningsAdded, warningsAdded, typeSelected, isByCustomer, isByDefaults }) => {
  const { id } = useParams()

  const { data: { warnings } = {} } = useQuery(queries.Warnings)
  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(id) } })

  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(warnings?.length / PAGE_SIZE)

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
      <Label>All</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Text</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Is default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            warnings
              ?.filter(w => (
                (isByDefaults
                  ? w.isDefault
                  : true) &&
                (isByCustomer
                  ? w.customer?.id === workInstruction.customer.id
                  : true) &&
                w.warningType === typeSelected
              ))
              .slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)
              .map((w, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <EditWarning id={w.id} />
                    </TableCell>
                    <TableCell>{w.content}</TableCell>
                    <TableCell>{w.customer?.name}</TableCell>
                    <TableCell><Checkbox checked={w.isDefault} disabled /></TableCell>
                    <TableCell>
                      <Button variant='ghost' size='icon' disabled={warningsAdded?.find(ww => ww.id === w.id)} onClick={() => setWarningsAdded(wa => [...wa, w])}>
                        <ArrowRightIcon className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
          }
        </TableBody>
      </Table>
      <WarningsTablePagination pageIndex={pageIndex} setPageIndex={setPageIndex} pageCount={pageCount} nextPage={nextPage} previousPage={previousPage} canGetNextPage={canGetNextPage} canGetPreviousPage={canGetPreviousPage} />
    </div>
  )
}

const WarningsAdded = ({ warnings, setWarningsAdded, typeSelected }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(warnings?.length / PAGE_SIZE)

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
      <Label>Selected</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Text</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Is default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            warnings?.filter(w => w.warningType === typeSelected).slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((w, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    <EditWarning id={w.id} />
                  </TableCell>
                  <TableCell>{w.content}</TableCell>
                  <TableCell>{w.customer?.name}</TableCell>
                  <TableCell><Checkbox checked={w.isDefault} disabled /></TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' onClick={() => setWarningsAdded(wa => wa.filter(ww => ww.id !== w.id))}>
                      <Cross2Icon className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
      <WarningsTablePagination pageIndex={pageIndex} setPageIndex={setPageIndex} pageCount={pageCount} nextPage={nextPage} previousPage={previousPage} canGetNextPage={canGetNextPage} canGetPreviousPage={canGetPreviousPage} />
    </div>
  )
}

const CreateNewWarning = () => {
  const { id } = useParams()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(id) } })
  const { data: { customers } = {} } = useQuery(queries.Customers)

  const [customer, setCustomer] = useState()
  const [content, setContent] = useState('')
  const [isDefault, setIsDefault] = useState()
  // one of 'warning', 'caution', 'note'
  const [type, setType] = useState({ name: 'Warning', id: 'warning' })

  useEffect(() => {
    if (workInstruction) {
      setCustomer(workInstruction.customer)
    }
  }, [workInstruction])

  const [createWarningMutation] = useMutation(mutations.CreateWarning)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveWarning = async () => {
    await saveWithToast(
      () => createWarningMutation({
        variables: {
          warning: {
            warningType: type.id,
            isDefault,
            content,
            customerId: customer?.id
          }
        },
        update (cache, { data: { createWarning: warning } }) {
          cache.modify({
            fields: {
              warnings (existingWarnings = []) {
                const newWarningRef = cache.writeFragment({
                  data: warning,
                  fragment: gql`
                    fragment NewWarning on Warning {
                      id
                    }
                  `
                })
                return [...existingWarnings, newWarningRef]
              }
            }
          })
        }
      }),
      toast,
      'Warning created',
      setIsSaving
    )
    setCustomer()
    setContent('')
    setIsDefault()
    setShowDialog(false)
  }

  const [showDialog, setShowDialog] = useState(false)

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger>
        <Button className='self-end flex max-w-sm mt-4 mb-4'>
          Create new
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Warning, Caution or Note</DialogTitle>
          <S
            currentValue={type}
            handleSelectChange={id => setType({ id, name: id })}
            values={[
              { id: 'warning', name: 'Warning' },
              { id: 'caution', name: 'Caution' },
              { id: 'note', name: 'Note' }
            ]}
            nameKey='name'
            valueKey='id'
            placeholder='Type...'
            label='Type'
          />
          <S
            currentValue={customer}
            handleSelectChange={id => setCustomer(customers.find(c => c.id === id))}
            values={customers}
            nameKey='name'
            valueKey='id'
            placeholder='Select customer...'
            label='Customer'
          />
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>Text</Label>
              <Textarea style={{ minHeight: 100 }} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          </div>
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>Is default</Label>
              <Checkbox onCheckedChange={v => setIsDefault(v)} checked={isDefault} />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className='flex-col flex pt-8'>
            <Button disabled={isSaving} className='self-end flex' onClick={() => saveWarning()}>
              {
                isSaving
                  ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      Creating
                    </>
                    )
                  : 'Create'
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const EditWarning = ({ id }) => {
  const { data: { customers } = {} } = useQuery(queries.Customers)
  const { data: { warnings } = {} } = useQuery(queries.Warnings)

  const warning = warnings?.find(w => w.id === id)

  const [customer, setCustomer] = useState()
  const [content, setContent] = useState('')
  const [isDefault, setIsDefault] = useState()

  useEffect(() => {
    if (warning) {
      setCustomer(warning.customer)
      setContent(warning.content)
      setIsDefault(warning.isDefault)
    }
  }, [warning])

  const [saveWarningMutation] = useMutation(mutations.SaveWarning)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveWarning = async () => {
    await saveWithToast(
      () => saveWarningMutation({
        variables: {
          warning: {
            id: warning.id,
            isDefault,
            content,
            customerId: customer?.id
          }
        }
      }),
      toast,
      'Warning saved',
      setIsSaving
    )
    setShowDialog(false)
  }

  const [showDialog, setShowDialog] = useState(false)

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger>
        <Button variant='ghost' size='icon'>
          <Pencil1Icon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit warning</DialogTitle>
          <S
            currentValue={customer}
            handleSelectChange={id => setCustomer(customers.find(c => c.id === id))}
            values={customers}
            nameKey='name'
            valueKey='id'
            placeholder='Select customer...'
            label='Customer'
          />
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>Text</Label>
              <Textarea style={{ minHeight: 100 }} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          </div>
          <div className='pt-8'>
            <div className='grid w-full items-center gap-3'>
              <Label>Is default</Label>
              <Checkbox onCheckedChange={v => setIsDefault(v)} checked={isDefault} />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className='flex-col flex pt-8'>
            <Button disabled={isSaving} className='self-end flex' onClick={() => saveWarning()}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
