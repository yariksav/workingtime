
export default class WorkingTime {
  constructor (periods) {
    this.periods = this.setPeriods(periods)
  }
  
  setPeriods (periods) {
    return (periods || []).map(item => {
      let indexTo = item.close ? item.close.day + item.close.time : '00000'
      return {
        indexFrom: item.open.day + item.open.time,
        indexTo,
        ...item
      }
    }).sort((a, b) => a.indexFrom > b.indexFrom)
  }

  isOpen () {
    return this.isOpenAt(new Date())
  }

  isOpenAt (date) {
    if (!date || !(date instanceof Date)) {
      return false
    }
    return Boolean(this.currentPeriodFor(date))
  }

  // isNonStop () {
  // }

  static getDateIndex (date) {
    if (!date) {
      return null
    }
    let currentDay = date.getDay()
    let currentTime = ('00' + date.getHours()).slice(-2) + ('00' + date.getMinutes()).slice(-2)
    return currentDay + currentTime
  }
  
  static fetchDate (date, event) {
    if (!event || !(date instanceof Date)) {
      return null
    }
    const day = date.getDay()
    const daysDiff = event.day >= day ? event.day - day : event.day + 7 - day
    const hours = event.time.slice(0, 2)
    const minutes = event.time.slice(2, 4)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysDiff, hours, minutes, 0)
  }

  getInfo () {
    return this.getInfoFor(new Date())
  }

  static getDateDiffs (date1, date2) {
    if (!date1 || !date2) {
      return null
    }
    return (date2.getTime() - date1.getTime()) / 1000
  }

  getInfoFor (date) {
    const period = this.currentPeriodFor(date)
    const nextPeriod = this.nextPeriodFor(date)
    const isOpen = Boolean(period)
    const nextEventDate = isOpen ? WorkingTime.fetchDate(date, period.close) : WorkingTime.fetchDate(date, nextPeriod && nextPeriod.open)
    return {
      isOpen,
      currentPeriod: period,
      currentDate: date,
      nextPeriod,
      nextDiff: WorkingTime.getDateDiffs(date, nextEventDate),
      nextEventDate,
      nextEventType: isOpen ? 'close' : 'open'
    }
  }

  nextPeriodFor (date) {
    let currentIndex = WorkingTime.getDateIndex(date)
    let firstElement = null
    let period = this.periods.reduce((element, item) => {
      if (item.indexFrom > currentIndex && (!element || element.indexFrom >= item.indexFrom)) {
        element = item
      }
      return element
    }, null)
    if (!period) {
      period = this.periods[0]
    }
    return period
  }

  currentPeriodFor (date) {
    let currentIndex = WorkingTime.getDateIndex(date)
    let period = this.periods.find(item => {
      return item.indexFrom < item.indexTo ? 
        item.indexFrom <= currentIndex && item.indexTo >= currentIndex :
        item.indexFrom <= currentIndex || item.indexTo >= currentIndex
    })
    return period
  }
}
