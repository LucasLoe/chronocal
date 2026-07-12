import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(localizedFormat)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
