import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'
import * as actions from './redux/actions'
import * as types from './redux/types'
import store from './redux/store'

import './App.css';
import ChartsPage from './pages/ChartsPage.js'
import MapPage from './pages/MapPage.js'
import AboutPage from './pages/AboutPage.js'
import StatePage from './pages/StatePage.js'

class App extends React.Component {
  componentDidMount() {
    store.dispatch(actions.fetchStates())
  }

  render() {
    return (
      <BrowserRouter>
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
            <Route path="/states/:stateAbbrev" component={StatePage} /> 
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
