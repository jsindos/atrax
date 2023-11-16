import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { queries, mutations } from '@/queries'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Cross2Icon, Pencil1Icon, ReloadIcon } from '@radix-ui/react-icons'
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
import TablePagination, { PAGE_SIZE } from './WorkInstructionWarnings/TablePagination'
import { saveWithToast } from '@/utils'
import { useToast } from '@/components/ui/use-toast'
import { I } from './WorkInstructionDetail'

export default () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, { variables: { id: Number(id) } })

  const [isSaving, setIsSaving] = useState()
  const [materialsAdded, setMaterialsAdded] = useState([])
  const [saveWorkInstructionMutation] = useMutation(mutations.SaveWorkInstruction)

  const { toast } = useToast()

  useEffect(() => {
    if (workInstruction) {
      setMaterialsAdded(workInstruction?.materials || [])
    }
  }, [workInstruction])

  const saveMaterials = async () => {
    await saveWithToast(
      () =>
        saveWorkInstructionMutation({
          variables: {
            workInstruction: {
              id: Number(id),
              materialIds: materialsAdded.map((m) => m.id)
            }
          }
        }),
      toast,
      null,
      setIsSaving
    )
  }

  return (
    <div className='container mx-auto px-4 pb-8'>
      <div className='flex justify-between row pt-8'>
        <h3>{workInstruction?.title} Materials</h3>
        <Button onClick={() => navigate(`/work_instructions/${id}`)}>Back</Button>
      </div>
      <div className='flex-col flex pt-8'>
        <Button disabled={isSaving} className='self-end flex' onClick={() => saveMaterials()}>
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
      <CreateOrEditMaterial />
      <MaterialsAdded {...{ setMaterialsAdded, materialsAdded }} />
    </div>
  )
}

const MaterialsAdded = ({ materialsAdded, setMaterialsAdded }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = Math.ceil(materialsAdded?.length / PAGE_SIZE)

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
    <div className='w-full mt-8' style={{ display: 'flex', rowGap: '0.75rem', flexDirection: 'column' }}>
      <Label>Assigned Parts, Tools and Materials</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Stock Code</TableHead>
            <TableHead>Part No</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Use Case</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            materialsAdded?.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE).map((i, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <CreateOrEditMaterial id={i.id} />
                  </TableCell>
                  <TableCell>{i.stockCode}</TableCell>
                  <TableCell>{i.partNo}</TableCell>
                  <TableCell>{i.itemName}</TableCell>
                  <TableCell>{i.useCase}</TableCell>
                  <TableCell>{i.quantity}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setMaterialsAdded((ma) => ma.filter((mi) => mi.id !== i.id))}
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

const CreateOrEditMaterial = ({ id }) => {
  const { id: workInstructionId } = useParams()

  const { data: { workInstruction } = {} } = useQuery(queries.WorkInstruction, {
    variables: { id: Number(workInstructionId) }
  })

  const material = workInstruction?.materials?.find((m) => m.id === id)

  const [stockCode, setStockCode] = useState('')
  const [partNo, setPartNo] = useState('')
  const [itemName, setItemName] = useState('')
  const [useCase, setUseCase] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (material) {
      setStockCode(material.stockCode)
      setPartNo(material.partNo)
      setItemName(material.itemName)
      setUseCase(material.useCase)
      setQuantity(material.quantity)
    }
  }, [material])

  const [createMaterialMutation] = useMutation(mutations.CreateMaterial)

  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const createMaterial = async () => {
    await saveWithToast(
      () =>
        createMaterialMutation({
          variables: {
            material: {
              stockCode,
              partNo,
              itemName,
              useCase,
              quantity: Number(quantity),
              workInstructionId: Number(workInstructionId)
            }
          }
        }),
      toast,
      'Material created',
      setIsSaving
    )
    setStockCode('')
    setPartNo('')
    setItemName('')
    setUseCase('')
    setQuantity('')
    setShowDialog(false)
  }

  const [saveMaterialMutation] = useMutation(mutations.SaveMaterial)

  const saveMaterial = async () => {
    await saveWithToast(
      () =>
        saveMaterialMutation({
          variables: {
            material: {
              id,
              stockCode,
              partNo,
              itemName,
              useCase,
              quantity: Number(quantity)
            }
          }
        }),
      toast,
      'Material saved',
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
              <Button
                variant='ghost'
                size='icon'
              >
                <Pencil1Icon className='h-4 w-4' />
              </Button>
              )
            : <Button>Create new</Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{id ? 'Edit' : 'Create'}</DialogTitle>
          <I label='Stock Code' value={stockCode} handleInputChange={(e) => setStockCode(e.target.value)} />
          <I label='Part Number' value={partNo} handleInputChange={(e) => setPartNo(e.target.value)} />
          <I label='Item Name' value={itemName} handleInputChange={(e) => setItemName(e.target.value)} />
          <I label='Use Case' value={useCase} handleInputChange={(e) => setUseCase(e.target.value)} />
          <I label='Quantity' value={quantity} handleInputChange={(e) => setQuantity(e.target.value)} />
        </DialogHeader>

        <DialogFooter>
          <div className='flex-col flex pt-8'>
            <Button
              disabled={isSaving}
              className='self-end flex'
              onClick={id ? saveMaterial : createMaterial}
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
