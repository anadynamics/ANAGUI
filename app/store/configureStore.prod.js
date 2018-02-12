// @flow
import { createStore, applyMiddleware,compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import sagaPlugin from "kea-saga";
import { getStore } from "kea";
import localStoragePlugin from "kea-localstorage";
import {
  combineForms,
  createForms, // optional
} from "react-redux-form";
const history = createHashHistory();
import { initialConfigurationState } from "../reducers/configuration";

const configurationReducer=createForms({
  configuration: initialConfigurationState,
})
// const history = createBrowserHistory();
// const router = routerMiddleware(history);
// const enhancer = applyMiddleware(thunk, router);

// function configureStore(initialState?: counterStateType) {
//   return createStore(rootReducer, initialState, enhancer);
// }
const configureStore = (initialState) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];
  middleware.push(thunk);
  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));

  const enhancer = composeEnhancers(...enhancers);

  const store = getStore({
    // plugins to use globally (for all logic stores)
    plugins: [localStoragePlugin, sagaPlugin],

    // what root paths are available for kea
    paths: ["kea"],

    // additional reducers that your app uses
    reducers: configurationReducer,

    // preloaded state for redux
    preloadedState: initialState,

    // middleware that gets passed to applyMiddleware(...middleware)
    middleware: middleware,

    // the compose function, defaults to the one from redux-devtools-extension or redux's own compose
    compose: composeEnhancers,

    // gets passed to compose(middleware, ...enhancers)(createStore)
    enhancers: enhancers,
  });
  // Create Store

  if (module.hot) {
    module.hot.accept("../reducers", () => store.replaceReducer(require("../reducers"))); // eslint-disable-line global-require
  }

  return store;
};
const store = configureStore();
export default { store, history };
