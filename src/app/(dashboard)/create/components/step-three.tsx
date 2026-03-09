'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { CalendarIcon, Clock, Mail, Bell, Info } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { nextStep, prevStep, selectEventFormData, updateData } from '@/app/provider/slices/eventformslice'
import { toast } from 'sonner'
import { AutomatedReminder } from '@/types/event.type'
import { CustomInviteMessage } from './custom-invite-message'
import { AutomatedReminderConfig } from './automated-reminder-config'

const rsvpSchema = z.object({
  rsvpStartDate: z.date({ message: 'RSVP start date is required' }),
  rsvpStartTime: z.date({ message: 'RSVP start time is required' }),
  rsvpEndDate: z.date({ message: 'RSVP end date is required' }),
  rsvpEndTime: z.date({ message: 'RSVP end time is required' }),
})

type FormValues = z.infer<typeof rsvpSchema>

const createDefaultTime = (hours: number, minutes = 0) => {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d
}

const toTimeString = (date: Date | null) =>
  date
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : ''

const parseTimeString = (val: string): Date | null => {
  if (!val) return null
  const [hours, minutes] = val.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d
}

// ── Parse a date input value WITHOUT UTC offset shifting ───────────────────────
// `new Date("2025-12-01")` → midnight UTC → wrong local date in UTC+ timezones
// This parses year/month/day directly into local time
const parseDateInputValue = (value: string): Date | null => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  const d = new Date()
  d.setFullYear(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  return d
}

function DateTimeRow({
  label,
  dateField,
  timeField,
  timeRef,
  minDate,
  maxDate,
  defaultTime,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: {
  label: string
  dateField: any
  timeField: any
  dateRef?: React.RefObject<HTMLInputElement>
  timeRef: React.RefObject<HTMLInputElement>
  minDate?: string
  maxDate?: string
  defaultTime: string
  onDateChange: (d: Date | null) => void
  onTimeChange: (d: Date | null) => void
  dateError?: string
  timeError?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Date</label>
          <div className="relative">
            <Input
              type="date"
              min={minDate}
              max={maxDate}
              value={
                dateField.value
                  ? `${dateField.value.getFullYear()}-${String(dateField.value.getMonth() + 1).padStart(2, '0')}-${String(dateField.value.getDate()).padStart(2, '0')}`
                  : ''
              }
              onChange={(e) => onDateChange(parseDateInputValue(e.target.value))}
              className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {dateError && <p className="text-xs text-red-500">{dateError}</p>}
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Time</label>
          <div className="relative">
            <Input
              type="time"
              ref={timeRef}
              defaultValue={toTimeString(timeField.value) || defaultTime}
              onChange={(e) => onTimeChange(parseTimeString(e.target.value))}
              className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
            />
            <button
              type="button"
              onClick={() => timeRef.current?.showPicker?.()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          {timeError && <p className="text-xs text-red-500">{timeError}</p>}
        </div>
      </div>
    </div>
  )
}

export default function StepThree() {
  const dispatch = useDispatch()
  const data = useSelector(selectEventFormData)
  const startTimeRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)

  const [customInviteMessage, setCustomInviteMessage] = useState(
    data.customInviteMessage ?? ''
  )
  const [automatedReminders, setAutomatedReminders] = useState<AutomatedReminder[]>(
    data.automatedReminders ?? []
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      rsvpStartDate: data.rsvpStartDateTime ? new Date(data.rsvpStartDateTime as any) : new Date(),
      rsvpStartTime: data.rsvpStartDateTime ? new Date(data.rsvpStartDateTime as any) : createDefaultTime(9),
      rsvpEndDate: data.rsvpEndDateTime ? new Date(data.rsvpEndDateTime as any) : undefined,
      rsvpEndTime: data.rsvpEndDateTime ? new Date(data.rsvpEndDateTime as any) : createDefaultTime(23, 59),
    },
  })

  const handleInviteMessageChange = (message: string) => {
    setCustomInviteMessage(message)
    dispatch(updateData({ customInviteMessage: message }))
  }

  const handleAutomatedRemindersChange = (reminders: any[] | AutomatedReminder[]) => {
    setAutomatedReminders(reminders)
    dispatch(updateData({ automatedReminders: reminders }))
  }

  const handleContinue = (values: FormValues) => {
    // Combine start date + time
    const rsvpStartDateTime = new Date(values.rsvpStartDate)
    rsvpStartDateTime.setHours(
      values.rsvpStartTime.getHours(),
      values.rsvpStartTime.getMinutes(),
      0, 0
    )

    // Combine end date + time
    const rsvpEndDateTime = new Date(values.rsvpEndDate)
    rsvpEndDateTime.setHours(
      values.rsvpEndTime.getHours(),
      values.rsvpEndTime.getMinutes(),
      0, 0
    )

    // RSVP end must be after start
    if (rsvpEndDateTime <= rsvpStartDateTime) {
      toast.warning('RSVP end must be after RSVP start')
      return
    }

    // RSVP must close before event starts
    if (data.startDateTime) {
      const eventStart = new Date(data.startDateTime)
      if (rsvpEndDateTime > eventStart) {
        toast.warning('RSVP must close before the event starts')
        return
      }
    }

    dispatch(
      updateData({
        enableRsvp: true,
        rsvpStartDateTime: rsvpStartDateTime,
        rsvpEndDateTime: rsvpEndDateTime,
        customInviteMessage,
        automatedReminders,
      })
    )
    dispatch(nextStep())
  }

  const maxRsvpDate = data.startDateTime
    ? new Date(data.startDateTime).toISOString().split('T')[0]
    : undefined

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleContinue)} className="flex flex-col gap-6 mb-6">

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">
            RSVP Scheduling <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-500">
            Configure when attendees can RSVP to your event. This helps you track attendance and send targeted communications.
          </p>
          {data.startDateTime && (
            <p className="text-xs font-medium text-blue-600 mt-1">
              Event starts: {new Date(data.startDateTime).toLocaleString()}
            </p>
          )}
        </div>

        {/* RSVP Opens */}
        <FormField
          control={form.control}
          name="rsvpStartDate"
          render={({ field: dateField }) => (
            <FormField
              control={form.control}
              name="rsvpStartTime"
              render={({ field: timeField }) => (
                <FormItem>
                  <DateTimeRow
                    label="RSVP Opens"
                    dateField={dateField}
                    timeField={timeField}
                    timeRef={startTimeRef as React.RefObject<HTMLInputElement>}
                    minDate={new Date().toISOString().split('T')[0]}
                    maxDate={maxRsvpDate}
                    defaultTime="09:00"
                    onDateChange={dateField.onChange}
                    onTimeChange={timeField.onChange}
                    dateError={form.formState.errors.rsvpStartDate?.message}
                    timeError={form.formState.errors.rsvpStartTime?.message}
                  />
                </FormItem>
              )}
            />
          )}
        />

        {/* RSVP Closes */}
        <FormField
          control={form.control}
          name="rsvpEndDate"
          render={({ field: dateField }) => (
            <FormField
              control={form.control}
              name="rsvpEndTime"
              render={({ field: timeField }) => (
                <FormItem>
                  <DateTimeRow
                    label="RSVP Closes"
                    dateField={dateField}
                    timeField={timeField}
                    timeRef={endTimeRef as React.RefObject<HTMLInputElement>}
                    minDate={
                      form.getValues('rsvpStartDate')
                        ? (() => {
                            const d = form.getValues('rsvpStartDate')
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                          })()
                        : new Date().toISOString().split('T')[0]
                    }
                    maxDate={maxRsvpDate}
                    defaultTime="23:59"
                    onDateChange={dateField.onChange}
                    onTimeChange={timeField.onChange}
                    dateError={form.formState.errors.rsvpEndDate?.message}
                    timeError={form.formState.errors.rsvpEndTime?.message}
                  />
                </FormItem>
              )}
            />
          )}
        />

        {/* Tip box */}
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 leading-relaxed">
            <strong>Tip:</strong> RSVP should close at least a few hours before your event starts to give you time to prepare based on confirmed attendance.
          </p>
        </div>

        {/* RSVP Configuration & Reminders */}
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">RSVP Configuration & Reminders</h3>
          <p className="text-sm text-gray-500">
            Customize your RSVP confirmation message and set up automated reminders for attendees.
          </p>
        </div>

        <Tabs defaultValue="invite">
          <TabsList className="w-full rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="invite"
              className="flex-1 flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5B1A57] transition-all"
            >
              <Mail className="w-4 h-4" />
              RSVP Confirmation
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="flex-1 flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5B1A57] transition-all"
            >
              <Bell className="w-4 h-4" />
              Automated Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="mt-3">
            <Card className="rounded-xl border border-gray-200">
              <CardContent className="pt-5">
                <CustomInviteMessage
                  eventName={data.name ?? 'Your Event'}
                  defaultMessage={customInviteMessage}
                  onSave={handleInviteMessageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="mt-3">
            <Card className="rounded-xl border border-gray-200">
              <CardContent className="pt-5">
                <AutomatedReminderConfig
                  eventId={undefined}
                  existingReminders={automatedReminders}
                  onSave={handleAutomatedRemindersChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="submit"
            className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors"
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => dispatch(prevStep())}
            className="w-full h-11 text-gray-700 hover:text-gray-900 font-medium"
          >
            Back
          </Button>
        </div>
      </form>
    </Form>
  )
}