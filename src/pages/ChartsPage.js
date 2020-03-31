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
          ['none', 'none'],
          ['region', 'region']
        ]} />
        <Filter accessors={[aggregate, setAggregate]} options={[
          ['state', 'state'],
          ['region', 'region'],
          ['country', 'country']
        ]} />
        <Filter accessors={[chartType, setChartType]} options={[
          ['daily', 'daily'],
          ['cumulative', 'cumulative']
        ]} />
        <Filter accessors={[basis, setBasis]} options={[
          ['per-1m', 'per 1m'],
          ['absolute', 'absolute'],
          ['percentage', '%']
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