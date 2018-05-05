// @flow
import React, { Component } from 'react';
import Home from '../components/Home';
import {JoyrideContext} from './App.js'
type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return (
      <JoyrideContext.Consumer>
        {context => {
          console.log(context);
          return <Home {...this.props} context={context} />;
        }}
      </JoyrideContext.Consumer>
    );
  }
}
