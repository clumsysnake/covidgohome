import React from 'react';
import ReactTooltip from 'react-tooltip'
import USAMap from './components/USAMap.js'

class MapPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      mapField: 'positive',
      basis: 'per-1m'
    }
  }

  render() {
    //TODO: break this out into component.
    const filterOption = (field, value, displayString) => {
      if(this.state[field] === value) {
       return <span className="filter-option"> {displayString} </span>
     } else {
       return <button onClick={() => this.setState({[field]: value})}>{displayString}</button>
     }
    }

    const filter = (field, label, options) => {
      return <div className="filter-control filter-{field}">
        {(label) ? `${label}:` : null}
        {options.map(o => filterOption(field, o[0], o[1]))}
      </div>
    }

    return <>
      <div className="top">
        <div className="filters">
          {filter('mapField', 'showing', [
            ['positive', 'positives'],
            ['total', '# tests'], 
            ['posPerc', '% positive'], 
            ['death', 'deaths']
          ])}
          {filter('basis', 'basis', [
            ['absolute', 'absolute'],
            ['per-1m', 'per 1m']
          ])}
        </div>
      </div>
      <div className="bottom usa-map">
        <USAMap
          field={this.state.mapField}
          basis={this.state.basis}
          setTooltipContent={(c) => this.setState({'tooltipContent': c})}
        />
        <ReactTooltip>{this.state.tooltipContent}</ReactTooltip>
      </div>
    </>
  }
}

export default MapPage

