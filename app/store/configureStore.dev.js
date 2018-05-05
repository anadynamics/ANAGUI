import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { createHashHistory } from "history";
import { routerMiddleware, routerActions } from "react-router-redux";
import { createLogger } from "redux-logger";
import rootReducer from "../reducers";
import * as counterActions from "../actions/counter";
import sagaPlugin from "kea-saga";
import { getStore } from "kea";
import localStoragePlugin from "kea-localstorage";
import {
  combineForms,
  createForms, // optional
} from "react-redux-form";
const history = createHashHistory();
import type { initialConfigurationState } from "../reducers/configuration";

const configurationReducer=createForms({
  configuration: initialConfigurationState,
})
const configureStore = (initialState) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware - React Redux Form actions are async so
  // we need to add this globally and not as a Kea plugin
  middleware.push(thunk);

  // Logging Middleware
  const logger = createLogger({
    level: "info",
    collapsed: true,
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== "test") {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...counterActions,
    ...routerActions,
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        actionCreators,
      })
    : compose;
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
