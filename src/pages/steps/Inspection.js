import React from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@radix-ui/react-icons'
import { cn } from '@/utils'
import CreateOrEditInspectionDialog from '../procedures/CreateOrEditInspectionDialog'

// activity: 'Dummy activity',
// criteria: 'Dummy criteria',
// verifyingDocument: 'Dummy document',
// repairAuthority: 'Dummy authority',
// shipStaff: 'Dummy staff',
// classSociety: 'Dummy society',
// hullInspector: 'Dummy inspector',
// primeContractor: 'Dummy contractor',
// SPO: 'Dummy SPO'

// RA, SS, CS, NHI, Prim, SPO

export default ({ inspection, className }) => {
  return (
    <div className={cn('shadow border rounded-xl p-8 flex row justify-between', className)}>
      <div>
        <div className='flex-col gap-3 flex w-full max-w-lg'>
          <Label>Activity</Label>
          <p style={{ fontSize: 14 }}>{inspection.activity}</p>
        </div>
        <div className='flex-col gap-3 flex pt-6'>
          <Label>Criteria</Label>
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
        <Button variant='outline' size='icon'>
          <TrashIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
