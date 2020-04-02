import React from 'react';
import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom'
import actions from './redux/actions'
import store from './redux/store'

import './App.css';
import ChartsPage from './pages/ChartsPage.js'
import MapPage from './pages/MapPage.js'
import AboutPage from './pages/AboutPage.js'
import StatePage from './pages/StatePage.js'

class App extends React.Component {
  componentDidMount() {
    store.dispatch(actions.covidTracking.fetchStatesDaily())
    store.dispatch(actions.johnsHopkins.fetchDailyReport())
  }

  render() {
    return (
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <nav>
              <ul className="nav">
                <li><Link to={`/charts`}>Charts</Link></li>
                <li><Link to={`/map`}>Map</Link></li>
                <li><Link to={`/about`}>About</Link></li>
              </ul>
            </nav>
            <span className="tagline"><em>...go back in your bat hole!</em></span>
          </header>
          <Switch>
            <Route path="/map" component={MapPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/charts" component={ChartsPage} />
            <Route path="/states/:stateAbbrev" component={StatePage} /> 
            <Route exact path="/">
              <Redirect to="/map" />
            </Route>
            <Route>
              <Redirect to="/map" />
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
