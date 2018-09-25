import './scss/style.scss'

import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware, ConnectedRouter } from 'react-router-redux'
import { HashRouter } from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'
import emsViewer from './reducers'
import App from './containers/App'

const history = createHistory()

const store = createStore(
  emsViewer,
  applyMiddleware(
    routerMiddleware(history),
    thunkMiddleware
  )
)

const containerEl = document.getElementById('ems_viewer')
const song = containerEl.getAttribute('data-song')
const source = containerEl.getAttribute('data-source')

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <HashRouter>
        <App song={song} source={source}/>
      </HashRouter>
    </ConnectedRouter>
  </Provider>,
  containerEl
)
