import React from 'react';
import './App.css';
import Grid from './components/Grid.js'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sort: "most-tests",
      aggregate: "none",
      group: "none",
      chartType: "daily"
    }
  }

  clickedSortMostTests = (e) => { this.setState({sort: "most-tests"}) }
  clickedSortPercentConfirmed = (e) => { this.setState({sort: "percent-confirmed"}) }
  clickedAggregateNone = (e) => { this.setState({aggregate: "none"}) }
  clickedAggregateRegion = (e) => { this.setState({aggregate: "region"}) }
  clickedGroupNone = (e) => { this.setState({group: "none"}) }
  clickedGroupRegion = (e) => { this.setState({group: "region"}) }
  clickedChartTypeDaily = (e) => { this.setState({chartType: "daily"}) } 
  clickedChartTypeCumulative = (e) => { this.setState({chartType: "cumulative"}) } 

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <em>...go back in your bat hole!</em> -- Tests & Positive Tests compared
          (pulled from <a href="https://covidtracking.com/">https://covidtracking.com/</a>)
          (ryan at ryan dawt org)
        </header>
        <div className="filters">
          <div className="sort">
            sort:
            {this.state.sort === "most-tests" ? " most tests " : <button onClick={this.clickedSortMostTests}>most tests</button>}
            |
            {this.state.sort === "percent-confirmed" ? " percent-confirmed " : <button onClick={this.clickedSortPercentConfirmed}>percent-confirmed</button>}
          </div>

          <div className="group">
            group:
            {this.state.group === "none" ? " none " : <button onClick={this.clickedGroupNone}>none</button>} 
            |
            {this.state.group === "region" ? " region " : <button onClick={this.clickedGroupRegion}>region</button>} 
          </div>
          
          <div className="aggregate">
            aggregate:
            {this.state.aggregate === "none" ? " none " : <button onClick={this.clickedAggregateNone}>none</button>}
            |
            {this.state.aggregate === "region" ? " region " : <button onClick={this.clickedAggregateRegion}>region</button>}
          </div>

          <div className="chart-type">
            type:
            {this.state.chartType === "daily" ? " daily " : <button onClick={this.clickedChartTypeDaily}>daily</button>}
            |
            {this.state.chartType === "cumulative" ? " cumulative " : <button onClick={this.clickedChartTypeCumulative}>cumulative</button>}
          </div>
        </div>
        <Grid sort={this.state.sort} aggregate={this.state.aggregate} group={this.state.group} chartType={this.state.chartType}/>
      </div>
    )
  }
}

export default App;
