// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

const { remote } = require('electron');

type Props = {
  mouseInRange: boolean
};
type State = { isFullscreen: boolean };

export default class FullscreenToggle extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    const win = remote.getCurrentWindow();

    this.state = { isFullscreen: win.isFullScreen() };
    (this: any).exitFullscreen = this.exitFullscreen.bind(this);
  }

  async componentDidMount() {
    ipcRenderer.on('enter-full-screen', () => {
      this.setState({ isFullscreen: true });
    });

    ipcRenderer.on('leave-full-screen', () => {
      console.log('leave-full-screen');
      this.setState({ isFullscreen: false });
    });
  }

  exitFullscreen = () => {
    const win = remote.getCurrentWindow();
    win.setFullScreen(false);
  };

  render() {
    const { mouseInRange } = this.props;
    const { isFullscreen } = this.state;

    if (isFullscreen && mouseInRange) {
      return (
        <>
          <div
            className="fullscreen-control bg-light p-2"
            onClick={this.exitFullscreen}
            onKeyDown={this.exitFullscreen}
            role="button"
            tabIndex="0"
          >
            <span className="fa fa-sign-out-alt pr-2" />
            exit fullscreen
          </div>
        </> //
      );
    }

    return <></>; //
  }
}
