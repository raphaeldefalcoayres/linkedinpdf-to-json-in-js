const { differenceInBusinessDays } = require('date-fns');
const holidayDaysCalendar = require('holidays-calendar-brazil')

const isWeekend = date => {
  const dayOfWeek = date.getDay();
  const isWeekend = (dayOfWeek === 6) || (dayOfWeek  === 0)
  return isWeekend
}

const workinDaysByYear = year => {
  const monthsWithHolidays = holidayDaysCalendar.Year(year).months
  const holidayDays = []

  monthsWithHolidays.forEach(month => {
    if(holidayDaysCalendar.Month(year, month)) {
      holidayDays.push({ month: month, days: [...holidayDaysCalendar.Month(year, month).days] })
    }
  })

  const holidayDaysNoWeekend = holidayDays.map(({ month, days }) => {
    return days.reduce((result, day) => {
      if(!isWeekend(new Date(year, (month - 1), day))) {
        return { month: month, days: [...holidayDaysCalendar.Month(year, month).days] }
      }
    }, [])
  }).filter(item => item)

  const startDate = new Date(`${year},1,1`)
  const endDate = new Date(`${year},12,31`)
  const workdaysBetween = differenceInBusinessDays(endDate, startDate)
  const workDays = workdaysBetween - holidayDaysCalendar.Year(year).total

  return { workDays, holidayDays, holidayDaysNoWeekend }
}

module.exports = {
  isWeekend,
  workinDaysByYear
}