// @flow
import ReactDOM from 'react-dom'
import React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { reducers } from 'experimental/reducers'
import SamplesCollecton from 'experimental/components/samples_collection'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'assets/css/main.css'
import { SampleContainer } from 'experimental/components/containers/SampleContainer'
import { initMovingArrows } from 'experimental/samples/moving_arrows'
import { initPlanetFocus } from 'experimental/samples/planets_focus'
import { initRandomTableau } from 'experimental/samples/basic_random_tableau'
import { initSmoothTableau } from 'experimental/samples/tableau_smooth'
import { initRule30 } from 'experimental/samples/rule_30'
import { initVichniacVote } from 'experimental/samples/vichniac_vote'
import { initOrbits } from 'experimental/samples/orbits'
import { initLuna } from 'experimental/samples/luna'
import { initWavyPlanet } from 'experimental/samples/wavy_planet'
import { initDotsSpiral } from 'experimental/samples/dots_spiral'
import { init as initMyceliumGrowth } from 'experimental/samples/mycelium_growth'
import { init as initVoronoyLloyd } from 'experimental/samples/voronoi_lloyd'
import { init as initVoronoyLloydVawes } from 'experimental/samples/voronoi_lloyd_vawes'
import { init as initVoronoyLloydVawesRand } from 'experimental/samples/voronoi_lloyd_vawes_rand'
import { init as initGravitation } from 'experimental/samples/gravitation'
import { init as initCoulombAndRing } from 'experimental/samples/coulomb_and_ring'
import { init as initRRTBasic } from 'experimental/samples/rrt_basic'
import { init as initRRTFlashes } from 'experimental/samples/rrt_flashes'
import { init as initSpringForce } from 'experimental/samples/spring_force'
import { init as initDotsMap } from 'experimental/samples/dots_map'
import { init as initDotsMapDynamic } from 'experimental/samples/dots_map_dynamic'

// const store = createStore(reducers, window.__REDUX_DEVTOOL1S_EXTENSION__(), applyMiddleware(thunk)
// const store = createStore(reducers, window.__REDUX_DEVTOOLS_1EXTENSION__())
// FIXME dunno why but window.__REDUX_DEVTOOLS_1EXTENSION__() doesnt exists
const store = createStore(reducers)

// TODO fix updateDebugInfo()
const createDrawer = init => <SampleContainer init={init} />

const page404 = () => (<h1>its like a 404 page</h1>)

ReactDOM.render((
  <Provider store={store}>
    <HashRouter>
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
          <Route path="/dots_spiral" render={() => createDrawer(initDotsSpiral)} />
          <Route path="/voronoi_lloyd" render={() => createDrawer(initVoronoyLloyd)} />
          <Route path="/voronoi_lloyd_vawes" render={() => createDrawer(initVoronoyLloydVawes)} />
          <Route path="/voronoi_lloyd_vawes_rand" render={() => createDrawer(initVoronoyLloydVawesRand)} />
          <Route path="/gravitation" render={() => createDrawer(initGravitation)} />
          <Route path="/coulomb_and_ring" render={() => createDrawer(initCoulombAndRing)} />
          <Route path="/rrt_basic" render={() => createDrawer(initRRTBasic)} />
          <Route path="/rrt_flashes" render={() => createDrawer(initRRTFlashes)} />
          <Route path="/spring_force" render={() => createDrawer(initSpringForce)} />
          <Route path="/dots_map" render={() => createDrawer(initDotsMap)} />
          <Route path="/dots_map_dynamic" render={() => createDrawer(initDotsMapDynamic)} />
          <Route path="/mycelium_growth" render={() => createDrawer(initMyceliumGrowth)} />
          {/* dont work. 404 routed from dev server itself */}
          <Route path="/" render={page404} />
        </Switch>
      </main>
    </HashRouter>
  </Provider>
  // $FlowIgnore
), document.body.appendChild(document.createElement('div')))
