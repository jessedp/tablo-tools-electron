import { Component } from 'react';
import { throttle } from '../utils/utils';

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
    this.state = {
      isFullscreen: window.ipcRenderer.sendSync('is-fullscreen'),
      zoomFactor: window.webFrame.getZoomFactor(),
    };

    (this as any).enterFullscreen = this.enterFullscreen.bind(this);
    (this as any).exitFullscreen = this.exitFullscreen.bind(this);
    (this as any).zoomIn = this.zoomIn.bind(this);
    (this as any).zoomOut = this.zoomOut.bind(this);
  }

  async componentDidMount() {
    window.ipcRenderer.on('enter-full-screen', async () => {
      // note this returns a promise we immediately run
      await throttle(() => {
        this.setState({
          isFullscreen: true,
          zoomFactor: window.webFrame.getZoomFactor(),
        });
      }, 250)();
    });
    window.ipcRenderer.on('leave-full-screen', () => {
      this.setState({
        isFullscreen: false,
        zoomFactor: window.webFrame.getZoomFactor(),
      });
    });
  }

  enterFullscreen = () => {
    window.ipcRenderer.send('set-fullscreen', true);
  };

  exitFullscreen = () => {
    window.ipcRenderer.send('set-fullscreen', false);
  };

  zoomIn = () => {
    window.webFrame.setZoomLevel(window.webFrame.getZoomLevel() - 1);
    this.setState({ zoomFactor: window.webFrame.getZoomFactor() });
  };

  zoomOut = () => {
    window.webFrame.setZoomLevel(window.webFrame.getZoomLevel() + 1);
    this.setState({ zoomFactor: window.webFrame.getZoomFactor() });
  };

  render() {
    const { mouseInRange } = this.props;
    const { isFullscreen, zoomFactor } = this.state;

    if (mouseInRange) {
      return (
        <div className="screen-control bg-light">
          {isFullscreen ? (
            <div
              className="bg-light p-2 fullscreen-control"
              onClick={this.exitFullscreen}
              onKeyDown={this.exitFullscreen}
              role="button"
              tabIndex={0}
            >
              <span
                className="fa fa-compress-arrows-alt pr-2"
                title="exit fullscreen"
              />
            </div>
          ) : (
            <span
              className="bg-light p-2"
              onClick={this.enterFullscreen}
              onKeyDown={this.enterFullscreen}
              role="button"
              tabIndex={0}
            >
              <span
                className="fa fa-expand-arrows-alt pr-2"
                title="enter fullscreen"
              />
            </span>
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
      );
    }

    return <></>;
  }
}
