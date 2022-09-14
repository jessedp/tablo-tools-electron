// import { ipcRenderer } from 'electron';
// const { webFrame } = window.require('electron').remote;
// const ipcRenderer = window.electron.ipcRenderer;
// const ipcRenderer = window.ipcRenderer;

// const { remote } = window.require('electron');
// console.log(remote);
// const ipcRenderer = remote.ipcRenderer;

import { Component } from 'react';
import { throttle } from '../utils/utils';

// const { ipcRenderer, webFrame } = window.electron;

// import { webFrame } from 'electron';
// const webFrame = window.webFrame;

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
      isFullscreen: window.ipcRenderer.sendSync('is-fullscreen'),
      zoomFactor: window.webFrame.getZoomFactor(),
    };
    (this as any).exitFullscreen = this.exitFullscreen.bind(this);
    (this as any).zoomIn = this.zoomIn.bind(this);
    (this as any).zoomOut = this.zoomOut.bind(this);
  }

  async componentDidMount() {
    window.ipcRenderer.on('enter-full-screen', () => {
      throttle(() => {
        // console.log('enter-full-screen rcvd');
        this.setState({
          isFullscreen: true,
          zoomFactor: window.webFrame.getZoomFactor(),
        });
      }, 250);
    });
    window.ipcRenderer.on('leave-full-screen', () => {
      // console.log('leave-full-screen rcvd');
      this.setState({
        isFullscreen: false,
        zoomFactor: window.webFrame.getZoomFactor(),
      });
    });
  }

  exitFullscreen = () => {
    // const win = remote.getCurrentWindow();
    // win.setFullScreen(false);
    window.electron.ipcRenderer.invoke('set-fullscreen', false);
  };

  zoomIn = () => {
    // ipcRenderer.invoke('zoom-in');
    window.webFrame.setZoomLevel(window.webFrame.getZoomLevel() - 1);
    this.setState({ zoomFactor: window.webFrame.getZoomFactor() });
  };

  zoomOut = () => {
    // ipcRenderer.invoke('zoom-in');
    window.webFrame.setZoomLevel(window.webFrame.getZoomLevel() + 1);
    this.setState({ zoomFactor: window.webFrame.getZoomFactor() });
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
