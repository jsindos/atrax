import { useToast } from '@/components/ui/use-toast'
import { mutations } from '@/queries'
import { saveWithToast } from '@/utils'
import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Label } from '@/components/ui/label'
import { S } from '../WorkInstructionDetail'
import { useParams } from 'react-router-dom'

const DEFAULT_VALUE = { shortName: 'N/A', longName: 'Not Applicable' }
const DUMMY_SELECT_VALUES = [DEFAULT_VALUE, { shortName: 'T', longName: 'Test' }]

export default ({ dialogTriggerClassName }) => {
  const { toast } = useToast()

  const { stepId } = useParams()

  const [createInspectionMutation] = useMutation(mutations.CreateInspection)

  const [isCreatingInspection, setIsCreatingInspection] = useState()
  const [createInspectionDialog, setCreateInspectionDialog] = useState()

  const [activity, setActivity] = useState('')
  const [criteria, setCriteria] = useState('')

  const [repairAuthority, setRepairAuthority] = useState(DEFAULT_VALUE)
  const [shipStaff, setShipStaff] = useState(DEFAULT_VALUE)
  const [classSociety, setClassSociety] = useState(DEFAULT_VALUE)
  const [hullInspector, setHullInspector] = useState(DEFAULT_VALUE)
  const [primeContractor, setPrimeContractor] = useState(DEFAULT_VALUE)
  const [SPO, setSPO] = useState(DEFAULT_VALUE)

  const createInspection = async () => {
    const inspectionInput = {
      activity,
      criteria,
      repairAuthority: repairAuthority.longName,
      shipStaff: shipStaff.longName,
      classSociety: classSociety.longName,
      hullInspector: hullInspector.longName,
      primeContractor: primeContractor.longName,
      SPO: SPO.longName,
      stepId: Number(stepId)
    }

    setIsCreatingInspection(true)
    await saveWithToast(
      () =>
        createInspectionMutation({
          variables: {
            inspection: inspectionInput
          }
        }),
      toast,
      'Inspection Created',
      setIsCreatingInspection
    )
    setCreateInspectionDialog(false)
  }
  return (
    <Dialog open={createInspectionDialog} onOpenChange={setCreateInspectionDialog}>
      <DialogTrigger asChild>
        <Button className={dialogTriggerClassName}>Create New Inspection or Test</Button>
      </DialogTrigger>
      <DialogContent className='Dialog'>
        <DialogHeader>
          <DialogTitle>New Inspection or Test</DialogTitle>
        </DialogHeader>
        <div className='flex flex-row gap-16'>
          <div className='w-full max-w-lg'>
            <div className='flex-col gap-3 flex'>
              <Label>Inspection/Test Activity</Label>
              <Textarea
                style={{ minHeight: 150 }}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
            </div>
            <div className='flex-col gap-3 flex mt-8'>
              <Label>Inspection/Test Criteria</Label>
              <Textarea
                style={{ minHeight: 150 }}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-col'>
            <h6>
              Inspection requirements
            </h6>
            <S
              className='pt-6'
              currentValue={repairAuthority}
              handleSelectChange={shortName => setRepairAuthority(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
              values={DUMMY_SELECT_VALUES}
              nameKey='longName'
              valueKey='shortName'
              placeholder='Select...'
              label='Repair Authority'
            />
            <S
              className='pt-6'
              currentValue={shipStaff}
              handleSelectChange={shortName => setShipStaff(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
              values={DUMMY_SELECT_VALUES}
              nameKey='longName'
              valueKey='shortName'
              placeholder='Select...'
              label='Ship Staff'
            />
            <S
              className='pt-6'
              currentValue={classSociety}
              handleSelectChange={shortName => setClassSociety(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
              values={DUMMY_SELECT_VALUES}
              nameKey='longName'
              valueKey='shortName'
              placeholder='Select...'
              label='Class Society'
            />
            <S
              className='pt-6'
              currentValue={hullInspector}
              handleSelectChange={shortName => setHullInspector(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
              values={DUMMY_SELECT_VALUES}
              nameKey='longName'
              valueKey='shortName'
              placeholder='Select...'
              label='Hull Inspector'
            />
            <S
              className='pt-6'
              currentValue={primeContractor}
              handleSelectChange={shortName => setPrimeContractor(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
              values={DUMMY_SELECT_VALUES}
              nameKey='longName'
              valueKey='shortName'
              placeholder='Select...'
              label='Prime Contractor'
            />
            <S
              className='pt-6'
              currentValue={SPO}
              handleSelectChange={shortName => setSPO(DUMMY_SELECT_VALUES.find(value => value.shortName === shortName))}
              values={DUMMY_SELECT_VALUES}
              nameKey='longName'
              valueKey='shortName'
              placeholder='Select...'
              label='SPO'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={() => createInspection()}>
            {
              isCreatingInspection
                ? (
                  <>
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                    Creating
                  </>
                  )
                : (
                    'Create'
                  )
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
