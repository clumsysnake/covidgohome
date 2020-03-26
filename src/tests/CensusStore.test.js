import { censusDataForState, censusDataForAbbrev, stateNameForAbbrev } from '../stores/CensusStore'

describe('censusDataForAbbrev', () => {
  it('returns stats for state abbreviation', () => {
    let stats = censusDataForAbbrev('WA')
    expect(stats.population).toBeGreaterThan(1)
    expect(stats.density).toBeGreaterThan(1)
  })
})

describe('stateNameForAbbrev', () => {
  it('returns name for state abbreviation', () => {
    expect(stateNameForAbbrev('WA')).toEqual("Washington")
  })
})