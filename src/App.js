import React, { useEffect } from "react"
import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom'
import actions from './redux/actions'
import store from './redux/store'

import './App.css';
import ChartsPage from './pages/ChartsPage.js'
import MapPage from './pages/MapPage.js'
import AboutPage from './pages/AboutPage.js'
import StatePage from './pages/StatePage.js'

export default function App(props) {
  useEffect(() => {
    store.dispatch(actions.cghStates.fetch())
    store.dispatch(actions.cghCounties.fetch())
    store.dispatch(actions.nyt.fetchStates())
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <nav>
            <ul className="nav">
              <li><Link to={`/country/usa`}>USA</Link></li>
              <li><Link to={`/compare`}>States</Link></li>
              <li><Link to={`/about`}>About</Link></li>
            </ul>
          </nav>
          <span className="tagline"><em>...go back in your bat hole!</em></span>
        </header>
        <div className="page">
          <Switch>
            <Route path="/country/usa" component={MapPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/compare" component={ChartsPage} />
            <Route path="/states/:stateAbbrev" component={StatePage} /> 
            <Route exact path="/">
              <Redirect to="/country/usa" />
            </Route>
            <Route>
              <Redirect to="/country/usa" />
            </Route>
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  )
}
