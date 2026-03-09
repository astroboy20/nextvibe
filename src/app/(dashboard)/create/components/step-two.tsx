/* eslint-disable react-hooks/incompatible-library */
'use client'

import { noOfAttendees } from '@/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { nextStep, prevStep, selectEventFormData, setStep, updateData } from '@/app/provider/slices/eventformslice'


const eventTypeSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  numberOfAttendees: z.string().min(1, 'Number of attendees is required'),
  price: z.string().refine((val) => val === '' || !isNaN(Number(val)), {
    message: 'Price must be a number',
  }),
  fastTrack: z.boolean(),
  allowSponsorship: z.boolean(),
})

type FormValues = z.infer<typeof eventTypeSchema>


export default function StepTwo() {
  const dispatch = useDispatch()
  const data = useSelector(selectEventFormData)

  const form = useForm<FormValues>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      eventType: data.eventType ?? '',
      price: data.price ?? '',
      numberOfAttendees: data.numberOfAttendees ?? '',
      fastTrack: data.fastTrack ?? false,
      allowSponsorship: false,
    },
  })

  const eventType = form.watch('eventType')

  const handleNextStep = (values: FormValues) => {
    const payload = { ...values }

    // Free events default to price 0
    if (payload.eventType === 'free') {
      payload.price = '0'
    }

    dispatch(updateData(payload))

    if (!values.fastTrack) {
      dispatch(setStep(3))
    } else {
      dispatch(nextStep())
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNextStep)} className="flex flex-col gap-5 mb-6">

        {/* ── Event type ── */}
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11! w-full rounded-lg border-gray-300 focus:ring-[#5B1A57]">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Paid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Number of attendees ── */}
        <FormField
          control={form.control}
          name="numberOfAttendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Attendees</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11! w-full rounded-lg border-gray-300 focus:ring-[#5B1A57]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {noOfAttendees.map((opt: { label: string; value: string }) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Ticket price — paid ── */}
        {eventType === 'premium' && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Price (₦)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter price for paid event"
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ── Ticket price — free (read-only) ── */}
        {eventType === 'free' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Ticket Price (₦)</label>
            <Input
              value="0"
              disabled
              className="h-11 rounded-lg bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            />
          </div>
        )}

        {/* ── Fast track gamification ── */}
        <FormField
          control={form.control}
          name="fastTrack"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 bg-gray-50 hover:border-[#5B1A57]/30 transition-colors">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 data-[state=checked]:bg-[#5B1A57] data-[state=checked]:border-[#5B1A57]"
                />
              </FormControl>
              <FormLabel className="mt-0! font-medium text-sm leading-relaxed cursor-pointer">
                Would you like to fast track sales of your event ticket through gamification?
              </FormLabel>
            </FormItem>
          )}
        />

        {/* ── Actions ── */}
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