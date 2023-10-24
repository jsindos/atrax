import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mutations, queries } from '@/queries'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMutation, useQuery } from '@apollo/client'
import React, { forwardRef, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/ui/use-toast'
import { saveWithToast } from '@/utils'
import { firstColumn, secondColumn, thirdColumn, fourthColumn } from '../../cmc'
import { useRef } from 'react'

export const MyComponent = ({ setCMC }) => {
  const [firstValue, setFirstValue] = useState(null)
  const [secondValue, setSecondValue] = useState(null)
  const [thirdValue, setThirdValue] = useState(null)

  const [showSelectDialog, setShowSelectDialog] = useState()

  const handleFirstChange = (value) => {
    setFirstValue(value)
    setSecondValue(null)
    setThirdValue(null)
  }

  const handleSecondChange = (value) => {
    setSecondValue(value)
    setThirdValue(null)
  }

  const handleThirdChange = (value) => {
    setThirdValue(value)
  }

  const [fourthValue, setFourthValue] = useState(null)

  const handleFourthChange = (value) => {
    setFourthValue(value)
  }

  const handleButtonClick = (setCMC) => {
    if (fourthValue) {
      // Use fourthValue.description here
      const parts = fourthValue.description.split(/\s+/)
      const CMC = parts[parts.length - 1]
      console.log(CMC)
      console.log(setCMC)
      setCMC(CMC)
      setShowSelectDialog(false)
    } else {
      console.log('No value selected')
    }
  }
  const firstOptions = firstColumn
  const secondOptions = secondColumn.filter((item) => item.first === firstValue)
  const thirdOptions = thirdColumn.filter(
    (item) => item.first === firstValue && item.second === secondValue
  )
  const fourthOptions = fourthColumn.filter(
    (item) => item.first === firstValue && item.second === secondValue && item.third === thirdValue
  )

  return (
    <div>
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogTrigger>
          <Button>Lookup CMC</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Columns</DialogTitle>
          </DialogHeader>

          <Select onValueChange={handleFirstChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="First Column" />
            </SelectTrigger>
            <SelectContent>
              {firstOptions.map((item) => (
                <SelectItem key={item.first} value={item.first}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleSecondChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Second Column" />
            </SelectTrigger>
            <SelectContent>
              {secondOptions.map((item) => (
                <SelectItem key={item.second} value={item.second}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleThirdChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Third Column" />
            </SelectTrigger>
            <SelectContent>
              {thirdOptions.map((item) => (
                <SelectItem key={item.third} value={item.third}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleFourthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fourth Column" />
            </SelectTrigger>
            <SelectContent>
              {fourthOptions.map((item) => (
                <SelectItem key={item.fourth} value={item}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={() => handleButtonClick(setCMC)}>Use Selected Value</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default () => {
  const { id } = useParams()

  const { data: { customers } = {}, loading: loadingA } = useQuery(queries.Customers)
  const { data: { workInstruction } = {}, loading: loadingB } = useQuery(queries.WorkInstruction, {
    variables: { id: Number(id) },
  })

  const loading = loadingA || loadingB

  const [saveWorkInstructionMutation] = useMutation(mutations.SaveWorkInstruction)

  const [isSavingLocationFields, setIsSavingLocationFields] = useState()
  const [isSaving, setIsSaving] = useState()

  const { toast } = useToast()

  const saveWorkInstructionMainFields = () =>
    saveWithToast(
      () =>
        saveWorkInstructionMutation({
          variables: {
            workInstruction: {
              id: Number(id),
              title,
              draftingOrganisation,
              hoursToComplete,
              CMC,
              customerId: customer.id,
            },
          },
        }),
      toast,
      null,
      setIsSaving
    )

  const saveWorkInstructionLocationFields = async () => {
    await saveWithToast(
      () =>
        saveWorkInstructionMutation({
          variables: {
            workInstruction: {
              id: Number(id),
              system,
              shipSystem,
              subsystem,
              SYSCOM,
              MIPSeries,
              activityNumber,
            },
          },
        }),
      toast,
      'Location Data saved',
      setIsSavingLocationFields
    )
    setShowLocationDialog(false)
  }

  const [title, setTitle] = useState('')
  const [draftingOrganisation, setDraftingOrganisation] = useState('')
  const [hoursToComplete, setHoursToComplete] = useState('')
  const [CMC, setCMC] = useState('')
  const [system, setSystem] = useState('')
  const [shipSystem, setShipSystem] = useState('')
  const [subsystem, setSubsystem] = useState('')
  const [SYSCOM, setSYSCOM] = useState('')
  const [MIPSeries, setMIPSeries] = useState('')
  const [activityNumber, setActivityNumber] = useState('')
  const [customer, setCustomer] = useState()

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
      setCustomer(workInstruction.customer)
      setCMC(workInstruction.CMC)
    }
  }, [workInstruction])

  const navigate = useNavigate()

  const [showLocationDialog, setShowLocationDialog] = useState()

  const values = firstColumn.reduce((a, c) => [...a, { id: c.first, name: c.first }], [])

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between row pt-8">
        <h3>Update Work Instruction Details</h3>
        <BackButton
          onClick={() => navigate(`/customers/${workInstruction.customer.id}/work_instructions`)}
        />
      </div>
      {loading ? (
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          <div className="flex-col flex pt-8">
            <Button
              disabled={isSaving}
              className="self-end flex"
              onClick={() => saveWorkInstructionMainFields()}
            >
              {isSaving ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
          <I label="Title" value={title} handleInputChange={(e) => setTitle(e.target.value)} />
          <I
            label="Drafting Organisation"
            value={draftingOrganisation}
            handleInputChange={(e) => setDraftingOrganisation(e.target.value)}
          />
          <I
            label="Hours to Complete"
            value={hoursToComplete}
            handleInputChange={(e) => setHoursToComplete(e.target.value)}
          />

          <I label="CMC" value={CMC} handleInputChange={(e) => setCMC(e.target.value)} readOnly />

          <MyComponent setCMC={setCMC}> </MyComponent>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
              <DialogTrigger className="pt-8">
                <Button>Location Data</Button>
              </DialogTrigger>
              <DialogContent className="Dialog">
                <DialogHeader>
                  <DialogTitle>Location Data</DialogTitle>
                  <div className="flex flex-wrap">
                    <div className="w-full md:w-1/2">
                      <h6 className="pt-8">ESWBS Codes</h6>
                      <I
                        label="System"
                        value={system}
                        handleInputChange={(e) => setSystem(e.target.value)}
                      />
                      <I
                        label="Ship System"
                        value={shipSystem}
                        handleInputChange={(e) => setShipSystem(e.target.value)}
                      />
                      <I
                        label="Subsystem"
                        value={subsystem}
                        handleInputChange={(e) => setSubsystem(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <h6 className="pt-8">Ran Codes</h6>
                      <I
                        label="SYSCOM"
                        value={SYSCOM}
                        handleInputChange={(e) => setSYSCOM(e.target.value)}
                      />
                      <I
                        label="MIP Series"
                        value={MIPSeries}
                        handleInputChange={(e) => setMIPSeries(e.target.value)}
                      />
                      <I
                        label="Activity Number"
                        value={activityNumber}
                        handleInputChange={(e) => setActivityNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </DialogHeader>
                <DialogFooter>
                  <div className="flex-col flex pt-8">
                    <Button
                      disabled={isSavingLocationFields}
                      className="self-end flex"
                      onClick={() => saveWorkInstructionLocationFields()}
                    >
                      {isSavingLocationFields ? (
                        <>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <S
              // currentValue={type}
              // handleSelectChange={id => setType({ id, name: id })}
              values={[
                { id: 'warning', name: 'Warning' },
                { id: 'caution', name: 'Caution' },
                { id: 'note', name: 'Note' },
              ]}
              nameKey="name"
              valueKey="id"
              placeholder="Type..."
              label="Type"
            />
            <Button className="mt-8" onClick={() => navigate(`/work_instructions/${id}/warnings`)}>
              Warnings, Cautions and Notes
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export const BackButton = ({ onClick }) => {
  return (
    <Button variant="outline" size="icon" onClick={onClick}>
      <Cross2Icon className="h-4 w-4" />
    </Button>
  )
}

export const I = forwardRef(
  ({ className, label, value, handleInputChange, placeholder, type, name, readOnly }, ref) => {
    return (
      <div className={'pt-8 ' + className}>
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label>{label}</Label>
          <Input
            onChange={handleInputChange}
            {...{ value, placeholder, type, name, ref, readOnly }}
          />
        </div>
      </div>
    )
  }
)

export const S = ({
  label,
  className,
  currentValue,
  values,
  nameKey,
  valueKey,
  placeholder,
  handleSelectChange,
}) => {
  return (
    <div className={'pt-8 ' + className}>
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label>{label}</Label>
        <Select value={currentValue && currentValue[valueKey]} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="SelectContent">
            {values.map((v, i) => (
              <SelectItem key={i} value={v && v[valueKey]}>
                {v && v[nameKey]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
