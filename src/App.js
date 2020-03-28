import React from 'react';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import './App.css';
import ChartsPage from './ChartsPage.js'
import MapPage from './MapPage.js'
import AboutPage from './AboutPage.js'

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="app">
          <header className="app-header">
            <nav>
              <ul className="nav">
                <li>
                  <Link to={`/`}>Charts</Link>
                </li>
                <li>
                  <Link to={`/map`}>Map</Link>
                </li>
                <li>
                  <Link to={`/about`}>About</Link>
                </li>
              </ul>
            </nav>
            <span className="tagline"><em>...go back in your bat hole! </em></span>
          </header>
          <Switch>
            <Route path="/map">
              <MapPage />
            </Route>
            <Route exact path="/about">
              <AboutPage />
            </Route>
            <Route exact path="/">
              <ChartsPage />
            </Route>
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
