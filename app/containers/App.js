// @flow
import * as React from 'react';
import Joyride from 'react-joyride';

type Props = {
  children: React.Node
};
export const JoyrideContext = React.createContext();
export default class App extends React.Component<Props> {
  props: Props;
  constructor(props) {
    super(props);

    this.state = {
      joyrideOverlay: true,
      joyrideType: 'continuous',
      isReady: false,
      isRunning: false,
      stepIndex: 0,
      steps: [],
      selector: ''
    };
    this.callback = this.callback.bind(this);
    this.startJoyride = this.startJoyride.bind(this);
  }
  componentDidMount() {
      console.log("Mounted");
  }
  startJoyride = () => {
      console.log("start");
      this.setState(currentState => {
        currentState.isRunning = true;
        return currentState;
      });
  };
  addSteps(steps) {
    let newSteps = steps;

    if (!Array.isArray(newSteps)) {
      newSteps = [newSteps];
    }

    if (!newSteps.length) {
      return;
    }

    // Force setState to be synchronous to keep step order.
    this.setState(currentState => {
      currentState.steps = currentState.steps.concat(newSteps);
      return currentState;
    });
  }

  addTooltip(data) {
    this.joyride.addTooltip(data);
  }

  next() {
    this.joyride.next();
  }
  callback(data) {
    console.log('%ccallback', 'color: #47AAAC; font-weight: bold; font-size: 13px;'); // eslint-disable-line no-console
    console.log(data); // eslint-disable-line no-console

    this.setState({
      selector: data.type === 'tooltip:before' ? data.step.selector : ''
    });
  }

  render() {
    const {
      isReady,
      isRunning,
      joyrideOverlay,
      joyrideType,
      selector,
      stepIndex,
      steps
    } = this.state;
    return (
      <div id="mainContent">
        <Joyride
          ref={c => (this.joyride = c)}
          callback={this.callback}
          debug={false}
          autoStart={true}
          locale={{
            back: <span>Back</span>,
            close: <span>Close</span>,
            last: <span>Last</span>,
            next: <span>Next</span>,
            skip: <span>Skip</span>
          }}
          run={isRunning}
          showOverlay={joyrideOverlay}
          showSkipButton
          showStepsProgress
          stepIndex={stepIndex}
          steps={steps}
          type={joyrideType}
        />
        <JoyrideContext.Provider
          value={{
            addSteps: steps => this.addSteps(steps),
            startJoyride: () => this.startJoyride()
          }}
        >
          {this.props.children}
        </JoyrideContext.Provider>
      </div>
    );
  }
}
