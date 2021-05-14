import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

const { webFrame } = require('electron');

type Props = {
  mouseInRange: boolean;
};
type State = {
  isFullscreen: boolean;
  zoomFactor: number;
};
export default class ScreenControls extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // const win = remote.getCurrentWindow();
    this.state = {
      isFullscreen: ipcRenderer.sendSync('is-fullscreen'),
      zoomFactor: webFrame.getZoomFactor(),
    };
    (this as any).exitFullscreen = this.exitFullscreen.bind(this);
    (this as any).zoomIn = this.zoomIn.bind(this);
    (this as any).zoomOut = this.zoomOut.bind(this);
  }

  async componentDidMount() {
    ipcRenderer.on('enter-full-screen', () => {
      this.setState({
        isFullscreen: true,
        zoomFactor: webFrame.getZoomFactor(),
      });
    });
    ipcRenderer.on('leave-full-screen', () => {
      this.setState({
        isFullscreen: false,
        zoomFactor: webFrame.getZoomFactor(),
      });
    });
  }

  exitFullscreen = () => {
    // const win = remote.getCurrentWindow();
    // win.setFullScreen(false);
    ipcRenderer.invoke('set-fullscreen', false);
  };

  zoomIn = () => {
    // ipcRenderer.invoke('zoom-in');
    webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
    this.setState({ zoomFactor: webFrame.getZoomFactor() });
  };

  zoomOut = () => {
    // ipcRenderer.invoke('zoom-in');
    webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
    this.setState({ zoomFactor: webFrame.getZoomFactor() });
  };

  render() {
    const { mouseInRange } = this.props;
    const { isFullscreen, zoomFactor } = this.state;
    // const zoomFactor = webFrame.getZoomFactor();

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
              {Math.round(zoomFactor * 100)}%
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
