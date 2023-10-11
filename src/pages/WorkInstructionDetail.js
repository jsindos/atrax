import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { queries } from '@/queries'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Cross1Icon, Cross2Icon, ExitIcon, ReloadIcon } from '@radix-ui/react-icons'

export default () => {
  const { workInstructionId } = useParams()
  const { data: { customers } = {}, loading: loadingA } = useQuery(queries.Customers)
  const { data: { workInstructions } = {}, loading: loadingB } = useQuery(queries.WorkInstructions)

  const workInstruction = workInstructions?.find(w => w.id === Number(workInstructionId))

  const loading = loadingA || loadingB

  const [title, setTitle] = useState('')
  const [draftingOrganisation, setDraftingOrganisation] = useState('')
  const [hoursToComplete, setHoursToComplete] = useState('')
  const [system, setSystem] = useState('')
  const [shipSystem, setShipSystem] = useState('')
  const [subsystem, setSubsystem] = useState('')
  const [SYSCOM, setSYSCOM] = useState('')
  const [MIPSeries, setMIPSeries] = useState('')
  const [activityNumber, setActivityNumber] = useState('')

  useEffect(() => {
    if (workInstruction) {
      setTitle(workInstruction.title)
      setDraftingOrganisation(workInstruction.draftingOrganisation)
      setHoursToComplete(workInstruction.hoursToComplete)
      setSystem(workInstruction.system)
      setShipSystem(workInstruction.shipSystem)
      setSubsystem(workInstruction.subsystem)
      setSYSCOM(workInstruction.SYSCOM)
      setMIPSeries(workInstruction.MIPSeries)
      setActivityNumber(workInstruction.activityNumber)
    }
  }, [workInstruction])

  return (
    <div className='container mx-auto px-4'>
      <div className='flex justify-between row pt-8'>
        <h3>Update Work Instruction Details</h3>
        <Button variant='outline' size='icon'>
          <Cross2Icon className='h-4 w-4' />
        </Button>
      </div>
      {
        loading
          ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
          : (
            <>
              <div className='flex-col flex pt-8'>
                <Button className='self-end flex '>
                  Save Changes
                </Button>
              </div>
              <I label='Title' value={title} handleInputChange={(e) => setTitle(e.target.value)} />
              <I label='Drafting Organisation' value={draftingOrganisation} handleInputChange={(e) => setDraftingOrganisation(e.target.value)} />
              <I label='Hours to Complete' value={hoursToComplete} handleInputChange={(e) => setHoursToComplete(e.target.value)} />
              <S values={customers} nameKey='name' valueKey='id' placeholder={workInstruction?.customer.name || 'Customer'} label='Customer' />
              <Dialog>
                <DialogTrigger className='pt-8'>
                  <Button>
                    Location Data
                  </Button>
                </DialogTrigger>
                <DialogContent className='Dialog'>
                  <DialogHeader>
                    <DialogTitle>Location Data</DialogTitle>
                    <div className='flex flex-wrap'>
                      <div className='w-full md:w-1/2'>
                        <h6 className='pt-8'>ESWBS Codes</h6>
                        <I label='System' value={system} handleInputChange={(e) => setSystem(e.target.value)} />
                        <I label='Ship System' value={shipSystem} handleInputChange={(e) => setShipSystem(e.target.value)} />
                        <I label='Subsystem' value={subsystem} handleInputChange={(e) => setSubsystem(e.target.value)} />
                      </div>
                      <div className='w-full md:w-1/2'>
                        <h6 className='pt-8'>Ran Codes</h6>
                        <I label='SYSCOM' value={SYSCOM} handleInputChange={(e) => setSYSCOM(e.target.value)} />
                        <I label='MIP Series' value={MIPSeries} handleInputChange={(e) => setMIPSeries(e.target.value)} />
                        <I label='Activity Number' value={activityNumber} handleInputChange={(e) => setActivityNumber(e.target.value)} />
                      </div>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </>
            )
      }
    </div>
  )
}

const I = ({ className, label, value, handleInputChange }) => {
  return (
    <div className={'pt-8 ' + className}>
      <div className='grid w-full max-w-sm items-center gap-3'>
        <Label>{label}</Label>
        <Input value={value} onChange={handleInputChange} />
      </div>
    </div>
  )
}

const S = ({ label, className, currentValue, values, nameKey, valueKey, placeholder, handleSelectChange }) => {
  return (
    <div className={'pt-8 ' + className}>
      <div className='grid w-full max-w-sm items-center gap-3'>
        <Label>{label}</Label>
        <Select value={currentValue && currentValue[valueKey]} onValueChange={handleSelectChange}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {
              values.map((v, i) => (
                <SelectItem key={i} value={v && v[valueKey]}>
                  {v && v[nameKey]}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
