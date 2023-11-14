import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ReloadIcon, TrashIcon } from '@radix-ui/react-icons'
import { cn, saveWithToast } from '@/utils'
import CreateOrEditInspectionDialog from '../procedures/CreateOrEditInspectionDialog'
import { mutations } from '@/queries'
import { useMutation } from '@apollo/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

export default ({ isFullDetail, step, inspection, className }) => {
  const [deleteInspectionMutation] = useMutation(mutations.DeleteInspection)
  const [showDialog, setShowDialog] = useState()
  const { toast } = useToast()
  const [isDeletingInspection, setIsDeletingInspection] = useState(false)

  const deleteInspection = async () => {
    setIsDeletingInspection(true)
    await saveWithToast(
      () =>
        deleteInspectionMutation({
          variables: {
            inspectionId: inspection.id
          }
        }),
      toast,
      'Inspection Deleted',
      setIsDeletingInspection
    )
    setShowDialog(false)
  }

  return (
    <div className={cn('shadow border rounded-xl p-8', className)}>
      {
        isFullDetail && (
          <div className='flex-col gap-3 flex w-full mb-8'>
            <Label>Step Details</Label>
            <p style={{ fontSize: 14 }}>{step?.title}</p>
          </div>
        )
      }
      <div className='flex row justify-between'>
        <div>
          <div className='flex-col gap-3 flex w-full max-w-lg'>
            <Label>{isFullDetail ? 'Inspection/Test Activity' : 'Activity'}</Label>
            <p style={{ fontSize: 14 }}>{inspection.activity}</p>
          </div>
          <div className='flex-col gap-3 flex pt-6'>
            <Label>{isFullDetail ? 'Inspection/Test Criteria' : 'Criteria'}</Label>
            <p style={{ fontSize: 14 }}>{inspection.criteria}</p>
          </div>
        </div>
        <div className='flex row gap-3 align-center justify-between'>
          <div className='flex-col gap-3 flex'>
            <Label>RA</Label>
            <p style={{ fontSize: 14 }}>{inspection.repairAuthority}</p>
          </div>
          <div className='flex-col gap-3 flex'>
            <Label>SS</Label>
            <p style={{ fontSize: 14 }}>{inspection.shipStaff}</p>
          </div>
          <div className='flex-col gap-3 flex'>
            <Label>CS</Label>
            <p style={{ fontSize: 14 }}>{inspection.classSociety}</p>
          </div>
          <div className='flex-col gap-3 flex'>
            <Label>NHI</Label>
            <p style={{ fontSize: 14 }}>{inspection.hullInspector}</p>
          </div>
          <div className='flex-col gap-3 flex'>
            <Label>Prim</Label>
            <p style={{ fontSize: 14 }}>{inspection.primeContractor}</p>
          </div>
          <div className='flex-col gap-3 flex'>
            <Label>SPO</Label>
            <p style={{ fontSize: 14 }}>{inspection.SPO}</p>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <CreateOrEditInspectionDialog isEditing inspection={inspection} />
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant='outline' size='icon'>
                {
                isDeletingInspection ? <ReloadIcon className='h-4 w-4 animate-spin' /> : <TrashIcon className='h-4 w-4' />
              }
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete inspection</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this inspection?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => deleteInspection()}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
