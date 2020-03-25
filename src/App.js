import React from 'react';
import './App.css';
import Grid from './components/Grid.js'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sort: "most-tests",
      aggregate: "state",
      group: "none",
      chartType: "daily"
    }
  }

  clickedSortMostTests = (e) => { this.setState({sort: "most-tests"}) }
  clickedSortPercentConfirmed = (e) => { this.setState({sort: "percent-confirmed"}) }
  clickedAggregateState = (e) => { this.setState({aggregate: "state"}) }
  clickedAggregateRegion = (e) => { this.setState({aggregate: "region"}) }
  clickedAggregateCountry = (e) => { this.setState({aggregate: "country"}) }
  clickedGroupNone = (e) => { this.setState({group: "none"}) }
  clickedGroupRegion = (e) => { this.setState({group: "region"}) }
  clickedChartTypeDaily = (e) => { this.setState({chartType: "daily"}) } 
  clickedChartTypeCumulative = (e) => { this.setState({chartType: "cumulative"}) } 

  render() {
    return (
      <div className="App">
        <div className="top">
          <header className="App-header">
            <em>...go back in your bat hole! </em> 
            (pulled from <a href="https://covidtracking.com/">COVID Tracking Project</a>)
            (ryan at ryan dawt org)
          </header>
          <div className="filters">
            <div className="filter-sort">
              sort:
              {this.state.sort === "most-tests" ? " most tests " : <button onClick={this.clickedSortMostTests}>most tests</button>}
              |
              {this.state.sort === "percent-confirmed" ? " percent-confirmed " : <button onClick={this.clickedSortPercentConfirmed}>% confirmed</button>}
            </div>

            <div className="filter-group">
              group:
              {this.state.group === "none" ? " none " : <button onClick={this.clickedGroupNone}>none</button>} 
              |
              {this.state.group === "region" ? " region " : <button onClick={this.clickedGroupRegion}>region</button>} 
            </div>
            
            <div className="filter-aggregate">
              aggregate:
              {this.state.aggregate === "state" ? " state " : <button onClick={this.clickedAggregateState}>state</button>}
              |
              {this.state.aggregate === "region" ? " region " : <button onClick={this.clickedAggregateRegion}>region</button>}
              |
              {this.state.group === "country" ? " country " : <button onClick={this.clickedAggregateCountry}>country</button>} 
            </div>

            <div className="filter-chart-type">
              type:
              {this.state.chartType === "daily" ? " daily " : <button onClick={this.clickedChartTypeDaily}>daily</button>}
              |
              {this.state.chartType === "cumulative" ? " cumulative " : <button onClick={this.clickedChartTypeCumulative}>cumulative</button>}
            </div>
          </div>
        </div>
        <div className="bottom">
          <Grid
            sort={this.state.sort}
            aggregate={this.state.aggregate}
            group={this.state.group}
            chartType={this.state.chartType}
          />
        </div>
      </div>
    )
  }
}

export default App;
