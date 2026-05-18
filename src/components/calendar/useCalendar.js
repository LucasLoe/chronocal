import { useContext } from 'react'
import { CalendarContext } from './calendarContext'

export function useCalendar() {
  const context = useContext(CalendarContext)

  if (!context) {
    throw new Error('useCalendar must be used within CalendarRoot')
  }

  return context
}
