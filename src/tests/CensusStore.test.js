import { censusDataForState, censusDataForAbbrev, stateNameForAbbrev } from '../stores/CensusStore'

describe('censusDataForAbbrev', () => {
  it('returns stats for state abbreviation', () => {
    let stats = censusDataForAbbrev('WA')
    expect(stats.population).toBeGreaterThan(1)
    expect(stats.density).toBeGreaterThan(1)
  })

  it('returns null for unknown abbrev', () => {
    expect(censusDataForAbbrev('XX')).toEqual(null)
  })

})

describe('stateNameForAbbrev', () => {
  it('returns name for state abbreviation', () => {
    expect(stateNameForAbbrev('WA')).toEqual("Washington")
  })

  it('returns null for unknown abbrev', () => {
    expect(stateNameForAbbrev('XX')).toEqual(null)
  })
})