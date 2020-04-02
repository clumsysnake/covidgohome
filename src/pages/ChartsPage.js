import React, { useState } from 'react';
import Grid from '../components/Grid.js'
import Filter from '../components/Filter.js'

export default function ChartsPage(props) {
  const [sort, setSort] = useState("most-tests")
  const [aggregate, setAggregate] = useState("region")
  const [group, setGroup] = useState("none")
  const [chartType, setChartType] = useState("daily")
  const [basis, setBasis] = useState("per-1m")
  const [scaleMatching, setScaleMatching] = useState(true)

  return <>
    <div className="top">
      <div className="filters">
        <Filter accessors={[sort, setSort]} label="sort" options={[
          ['most-tests', 'most tests'],
          ['percent-positive', '% positive']
        ]} />
        <Filter accessors={[group, setGroup]} label="group" options={[
          'none',
          'region'
        ]} />
        <Filter accessors={[aggregate, setAggregate]} options={[
          'state',
          'region',
          'country'
        ]} />
        <Filter accessors={[chartType, setChartType]} options={[
          'daily',
          'cumulative',
          ['daily-new-cases', 'new cases']
        ]} />
        <Filter accessors={[basis, setBasis]} options={[
          'total',
          ['per-1m', 'total / capita'],
        ]} />
        <Filter accessors={[scaleMatching, setScaleMatching]} label="scale match" options={[
          [true, 'yes'],
          [false, 'no']
        ]} />
      </div>
    </div>
    <div className="bottom">
      <Grid
        sort={sort}
        aggregate={aggregate}
        group={group}
        chartType={chartType}
        basis={basis}
        scaleMatching={scaleMatching}
      />
    </div>
  </>
}