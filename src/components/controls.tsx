import React, {Component, ReactElement} from "react";

interface Props {
  traverseCb(toggle: boolean): void;
  speechCb(toggle: boolean): void;
}

interface State {
  checked: boolean;
  speech: boolean;
}

export default class Controls extends Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = { checked : false, speech : false };
  }

  render(): ReactElement {
    return <div style={{paddingLeft: '25px'}}>
      <p style={{width: '100%', marginTop : '0px', marginBottom : '8px', fontSize : '0.92em'}}>click to select, use arrow keys to navigate selection</p>

      <label>
        <input
          type="checkbox"
          checked={this.state.checked}
          onChange={() => {
            const value = !this.state.checked;
            this.props.traverseCb(value);
            this.setState({ checked: value });
          }}
          style={{marginLeft : '2px'}}
        />
        traverse
      </label>

      <label>
        <input
          type="checkbox"
          checked={this.state.speech}
          onChange={() => {
            const value = !this.state.speech;
            this.props.speechCb(value);
            this.setState({ speech: value });
          }}
        />
        speech
      </label>
    </div>;
  }
}
