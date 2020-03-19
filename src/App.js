import React from 'react';
import './App.css';
import Grid from './components/Grid.js'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          We said go back in your bat hole! (pulled from <a href="https://covidtracking.com/">https://covidtracking.com/</a>)
        </header>
        <Grid />
      </div>
    )
  }
}

export default App;
