import React from 'react';
import './App.css';
import Grid from './components/Grid.js'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <em>We said go back in your bat hole!</em> -- Tests vs Positive Tests
          (pulled from <a href="https://covidtracking.com/">https://covidtracking.com/</a>)
          (ryan at ryan dawt org)
        </header>
        <Grid />
      </div>
    )
  }
}

export default App;
