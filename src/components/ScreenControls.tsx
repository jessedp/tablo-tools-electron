import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

const { remote, webFrame } = require('electron');

type Props = {
  mouseInRange: boolean;
};
type State = {
  isFullscreen: boolean;
};
export default class ScreenControls extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const win = remote.getCurrentWindow();
    this.state = {
      isFullscreen: win.isFullScreen(),
    };
    (this as any).exitFullscreen = this.exitFullscreen.bind(this);
    (this as any).zoomIn = this.zoomIn.bind(this);
    (this as any).zoomOut = this.zoomOut.bind(this);
  }

  async componentDidMount() {
    ipcRenderer.on('enter-full-screen', () => {
      this.setState({
        isFullscreen: true,
      });
    });
    ipcRenderer.on('leave-full-screen', () => {
      this.setState({
        isFullscreen: false,
      });
    });
  }

  exitFullscreen = () => {
    const win = remote.getCurrentWindow();
    win.setFullScreen(false);
  };

  zoomIn = () => {
    webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
  };

  zoomOut = () => {
    webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
  };

  render() {
    const { mouseInRange } = this.props;
    const { isFullscreen } = this.state;
    const zoomFactor = webFrame.getZoomFactor();

    if (mouseInRange) {
      return (
        <>
          <div className="screen-control bg-light">
            {isFullscreen ? (
              <div
                className="bg-light p-2 fullscreen-control"
                onClick={this.exitFullscreen}
                onKeyDown={this.exitFullscreen}
                role="button"
                tabIndex={0}
              >
                <span className="fa fa-sign-out-alt pr-2" />
                exit fullscreen
              </div>
            ) : (
              ''
            )}
            <div className="zoom-control smallerish">
              <div
                className="p-2 zoom-btn"
                onClick={this.zoomIn}
                onKeyDown={this.zoomIn}
                role="button"
                tabIndex={0}
              >
                <span className="fa fa-minus pl-2 pr-2" />
              </div>
              <span className="fa fa-search pl-2 pr-2" />
              {zoomFactor * 100}%
              <div
                className="p-2 zoom-btn"
                onClick={this.zoomOut}
                onKeyDown={this.zoomOut}
                role="button"
                tabIndex={0}
              >
                <span className="fa fa-plus pl-2 pr-2" />
              </div>
            </div>
          </div>
        </>
      );
    }

    return <></>;
  }
}
