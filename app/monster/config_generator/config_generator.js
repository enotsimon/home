
import ReactDOM from 'react-dom'
import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import root_reducer from './reducers'
import * as actions from './actions'

import Util from "common/util"
import App from 'monster/config_generator/components/app'

export const store = createStore(root_reducer)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#app')
  );
});
