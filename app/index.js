// @flow
import ReactDOM from 'react-dom'
import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import SamplesCollecton from 'experimental/components/samples_collection'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'assets/css/main.css'
import { Sample } from 'experimental/components/Sample'
import { initMovingArrows } from 'experimental/moving_arrows'
import { initPlanetFocus } from 'experimental/planets_focus'
import { initRandomTableau } from 'experimental/basic_random_tableau'
import { initSmoothTableau } from 'experimental/tableau_smooth'
import { initRule30 } from 'experimental/rule_30'
import { initVichniacVote } from 'experimental/vichniac_vote'
import { initOrbits } from 'experimental/orbits'
import { initLuna } from 'experimental/luna'
import { initWavyPlanet } from 'experimental/planet_exp_2'

// TODO fix updateDebugInfo()
const createDrawer = init => <Sample additional={[]} init={init} />

const page404 = () => (<h1>its like a 404 page</h1>)

ReactDOM.render((
  <BrowserRouter>
    <main>
      <Switch>
        <Route exact path="/" component={SamplesCollecton} />
        <Route path="/samples_collection" component={SamplesCollecton} />
        <Route path="/moving_arrows" render={() => createDrawer(initMovingArrows)} />
        <Route path="/planets_focus" render={() => createDrawer(initPlanetFocus)} />
        <Route path="/basic_tableau" render={() => createDrawer(initRandomTableau)} />
        <Route path="/smooth_tableau" render={() => createDrawer(initSmoothTableau)} />
        <Route path="/rule_30" render={() => createDrawer(initRule30)} />
        <Route path="/vichniac_vote" render={() => createDrawer(initVichniacVote)} />
        <Route path="/orbits" render={() => createDrawer(initOrbits)} />
        <Route path="/luna" render={() => createDrawer(initLuna)} />
        <Route path="/wavy_sphere" render={() => createDrawer(initWavyPlanet)} />
        {/* dont work. 404 routed from dev server itself */}
        <Route path="/" render={page404} />
      </Switch>
    </main>
  </BrowserRouter>
  // $FlowIgnore
), document.body.appendChild(document.createElement('div')))
