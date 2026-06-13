import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(localizedFormat)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
