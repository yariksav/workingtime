import WorkingTime from '../src/WorkingTime'

const genDate = (day, hour, minute = 0) => {
  return new Date (0, 0, day, hour, minute)
}

describe('main', () => {
  it ('should gen correct date', () => {
    expect(genDate(0, 0).getDay()).toBe(0)
    expect(genDate(1, 0).getDay()).toBe(1)
    expect(genDate(1, 14).getHours()).toBe(14)
    expect(genDate(1, 13, 12).getMinutes()).toBe(12)
  })

  it('should set periods', () => {
    const testPeriod = []
    const wt = new WorkingTime(testPeriod)
    expect(wt.periods).toEqual(testPeriod)
  })

  it('should be correct openAt results for simple period', () => {
    const periods = [
      { open: { day: 0, time: '1000' }, close: { day: 0, time: '1300' } },
      { open: { day: 1, time: '0900' }, close: { day: 1, time: '2300' } },
      { open: { day: 2, time: '0900' }, close: { day: 2, time: '2300' } },
      { open: { day: 3, time: '0900' }, close: { day: 3, time: '2300' } },
      { open: { day: 4, time: '0900' }, close: { day: 4, time: '2300' } },
      { open: { day: 5, time: '0900' }, close: { day: 5, time: '2200' } },
      { open: { day: 6, time: '0900' }, close: { day: 6, time: '1700' } }
    ]
    const wt = new WorkingTime(periods)
    expect(wt.isOpenAt(genDate(0, 0))).toBeFalsy()
    expect(wt.isOpenAt(genDate(0, 10))).toBeTruthy()
    expect(wt.isOpenAt(genDate(0, 13))).toBeTruthy()
    expect(wt.isOpenAt(genDate(0, 14))).toBeFalsy()
    expect(wt.isOpenAt(genDate(0, 24))).toBeFalsy()
    expect(wt.isOpenAt(genDate(1, 8))).toBeFalsy()
    expect(wt.isOpenAt(genDate(1, 10))).toBeTruthy()
    expect(wt.isOpenAt(genDate(1, 24))).toBeFalsy()
    expect(wt.isOpenAt(genDate(2, 1))).toBeFalsy()
    expect(wt.isOpenAt(genDate(2, 23))).toBeTruthy()
    expect(wt.isOpenAt(genDate(6, 16))).toBeTruthy()
    expect(wt.isOpenAt(genDate(6, 18))).toBeFalsy()

    expect(wt.nextPeriodFor(genDate(0, 20))).toMatchObject({ open: { day: 1, time: '0900' }, close: { day: 1, time: '2300' } })
    expect(wt.nextPeriodFor(genDate(6, 20))).toMatchObject({ open: { day: 0, time: '1000' }, close: { day: 0, time: '1300' } })
  })


  it('should be correct openAt results for complex period', () => {
    const periods = [
      { open: { day: 1, time: '0900' }, close: { day: 2, time: '0200' } },
      { open: { day: 2, time: '0900' }, close: { day: 3, time: '0200' } },
      { open: { day: 3, time: '0900' }, close: { day: 4, time: '0200' } },
      { open: { day: 0, time: '0900' }, close: { day: 0, time: '2300' } }, // array should not be sorted by days
      { open: { day: 4, time: '0900' }, close: { day: 5, time: '0200' } },
      { open: { day: 5, time: '0900' }, close: { day: 5, time: '2300' } },
      { open: { day: 6, time: '0900' }, close: { day: 0, time: '0500' } }
    ]
    const wt = new WorkingTime(periods)
    expect(wt.isOpenAt(genDate(0, 0))).toBeTruthy()
    expect(wt.isOpenAt(genDate(0, 10))).toBeTruthy()
    expect(wt.isOpenAt(genDate(0, 23))).toBeTruthy()
    expect(wt.isOpenAt(genDate(0, 24))).toBeFalsy()
    expect(wt.isOpenAt(genDate(1, 8))).toBeFalsy()
    expect(wt.isOpenAt(genDate(1, 10))).toBeTruthy()
    expect(wt.isOpenAt(genDate(1, 24))).toBeTruthy()
    expect(wt.isOpenAt(genDate(2, 0))).toBeTruthy()
    expect(wt.isOpenAt(genDate(2, 1))).toBeTruthy()
    expect(wt.isOpenAt(genDate(2, 3))).toBeFalsy()
    expect(wt.isOpenAt(genDate(2, 9))).toBeTruthy()

    expect(wt.nextPeriodFor(genDate(6, 20))).toMatchObject({ open: { day: 0, time: '0900' }, close: { day: 0, time: '2300' } })
    expect(wt.nextPeriodFor(genDate(0, 0))).toMatchObject({ open: { day: 0, time: '0900' }, close: { day: 0, time: '2300' } })
    expect(wt.nextPeriodFor(genDate(0, 20))).toMatchObject({ open: { day: 1, time: '0900' }, close: { day: 2, time: '0200' } })

    expect(wt.getInfoFor(genDate(0, 20))).toMatchSnapshot()
    expect(wt.getInfoFor(genDate(1, 0))).toMatchSnapshot()
    expect(wt.getInfoFor(genDate(6, 23))).toMatchSnapshot()
  })

  it('should be correct openAt results for complex period', () => {
    const periods = [
      { open: { day: 3, time: '0900' }, close: { day: 4, time: '0200' } },
      { open: { day: 4, time: '0900' }, close: { day: 5, time: '0200' } },
      { open: { day: 5, time: '0900' }, close: { day: 2, time: '2300' } }
    ]
    const wt = new WorkingTime(periods)
    expect(wt.isOpenAt(genDate(2, 10))).toBeTruthy()
  })

  it('should be correct openAt results for non stop', () => {
    const periods = [
      { open: { day: 0, time: '0000' } }
    ]
    const wt = new WorkingTime(periods)
    expect(wt.isOpenAt(genDate(0, 0))).toBeTruthy()
    expect(wt.isOpenAt(genDate(1, 10))).toBeTruthy()
    expect(wt.isOpenAt(genDate(6, 24))).toBeTruthy()
    expect(wt.getInfoFor(genDate(2, 23))).toMatchSnapshot()
  })

  it('should be correct openAt results for none period', () => {
    const wt = new WorkingTime()
    expect(wt.isOpenAt(genDate(0, 0))).toBeFalsy()
    expect(wt.isOpenAt(genDate(1, 10))).toBeFalsy()
    expect(wt.isOpenAt(genDate(6, 24))).toBeFalsy()
    expect(wt.getInfoFor(genDate(2, 23))).toMatchSnapshot()
  })
})