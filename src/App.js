import React from 'react';
import './App.css';
import Grid from './components/Grid.js'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Grid />      
        </header>
      </div>
    )
  }
}

export default App;
