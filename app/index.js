import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { store, history } from "./store/configureStore";
import Root from "./containers/Root";
import "./app.global.css";
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
import purple from "material-ui/colors/purple";
import green from "material-ui/colors/green";
import Reboot from "material-ui/Reboot";

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: purple[300],
      main: purple[500],
      dark: purple[700],
    },
    secondary: {
      light: green[300],
      main: green[500],
      dark: green[700],
    },
  },
});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./containers/Root", () => {
    const NextRoot = require("./containers/Root"); // eslint-disable-line global-require
    render(
      <AppContainer>
        <MuiThemeProvider theme={theme}>
          <NextRoot store={store} history={history} />
        </MuiThemeProvider>
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
