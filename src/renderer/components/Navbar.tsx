import { Component } from 'react';

import { RouteComponentProps, withRouter } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import routes from '../constants/routes.json';
import PingStatus from './PingStatus';
import DbStatus from './DbStatus';
import SelectedBox from './SelectedBox';
import LogoBox from './Logo';
import ScreenControls from './ScreenControls';
import VersionStatus from './VersionStatus';

type Props = {
  location: Record<string, any>;
};
type State = {
  showToggle: boolean;
};

class Navbar extends Component<Props & RouteComponentProps, State> {
  lastMousePos: {
    x: number;
    y: number;
  };

  autohideTimer: NodeJS.Timeout | null;

  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      showToggle: false,
    };
    this.lastMousePos = {
      x: 0,
      y: 0,
    };
    this.autohideTimer = null;
    (this as any).mouseMove = this.mouseMove.bind(this);
  }

  mouseMove = (e: any) => {
    this.lastMousePos = {
      x: e.screenX,
      y: e.screenY,
    };
    // doing this so checkYInbounds can return a bool
    try {
      if (this.checkYInbounds(2)) {
        this.setState({
          showToggle: true,
        });
        if (this.autohideTimer) clearTimeout(this.autohideTimer);
        this.autohideTimer = setTimeout(
          () =>
            this.setState({
              showToggle: false,
            }),
          5000
        );
      } else if (!this.checkYInbounds(40)) {
        this.setState({
          showToggle: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  checkYInbounds = (limit = 10) => {
    const bounds = window.ipcRenderer.sendSync('get-content-bounds');
    if (!bounds) {
      throw Error('checkYInbounds - "bounds" is empty');
    }
    if (!this.lastMousePos) {
      throw Error('checkYInbounds - "this.lastMousePos" is empty');
    }
    return this.lastMousePos.y - bounds.y < limit;
  };

  render() {
    const { showToggle } = this.state;
    // dropdown state
    let ddText = 'Browse Recordings';
    let ddClass = 'outline-primary';
    // let toggleClass = 'outline-primary';
    const { location } = this.props;

    if (location.pathname === routes.SHOWS) {
      ddText = 'Shows & Series';
      ddClass = 'primary';
    }

    if (location.pathname === routes.MOVIES) {
      ddText = 'Movies';
      ddClass = 'primary';
    }

    if (location.pathname === routes.SPORTS) {
      ddText = 'Sports & Events';
      ddClass = 'primary';
    }

    if (location.pathname === routes.PROGRAMS) {
      ddText = 'Manual';
      ddClass = 'primary';
    }

    // if (ddClass) toggleClass = `${toggleClass} active`;
    return (
      <Row className="mb-2 top-bar" onMouseMove={this.mouseMove}>
        <ScreenControls mouseInRange={showToggle} />
        <Col md="7">
          <LogoBox />
          <div className="menu-buttons">
            <ButtonGroup className="ml-2 pt-1">
              <LinkContainer activeClassName="active" to={routes.HOME}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  as="button"
                  title="Home"
                >
                  <span className="fa fa-home" />
                </Button>
              </LinkContainer>
              <LinkContainer activeClassName="active" to={routes.LIVETV}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  as="button"
                  title="Watch Live"
                >
                  <span className="fa fa-tv" />
                </Button>
              </LinkContainer>

              <LinkContainer activeClassName="active" to={routes.OVERVIEW}>
                <Button
                  as="button"
                  size="sm"
                  variant="outline-primary"
                  className="align-middle"
                >
                  <span>Overview</span>
                </Button>
              </LinkContainer>

              <DropdownButton
                as={ButtonGroup}
                style={{
                  width: '160px',
                }}
                title={ddText}
                variant={ddClass}
              >
                <LinkContainer activeClassName="active" to={routes.SHOWS}>
                  <Dropdown.Item>
                    <span className="fa fa-tv pr-2 menu-icon" />
                    Shows & Series
                  </Dropdown.Item>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.MOVIES}>
                  <Dropdown.Item>
                    <span className="fa fa-film pr-2 menu-icon" />
                    Movies
                  </Dropdown.Item>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.SPORTS}>
                  <Dropdown.Item>
                    <span className="fa fa-quidditch pr-2 menu-icon" />
                    Sports & Events
                  </Dropdown.Item>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.PROGRAMS}>
                  <Dropdown.Item>
                    <span className="fa fa-keyboard pr-2 menu-icon" />
                    Manual
                  </Dropdown.Item>
                </LinkContainer>
              </DropdownButton>

              <LinkContainer activeClassName="active" to={routes.SEARCH}>
                <Button size="sm" variant="outline-primary" as="button">
                  Search
                </Button>
              </LinkContainer>
            </ButtonGroup>
          </div>
        </Col>
        <Col md="5">
          <Row>
            <Col md="2">
              <SelectedBox />
            </Col>
            <Col md="10" className="smaller pt-2 align-items menu-buttons">
              <div className="d-flex flex-row-reverse">
                <div>
                  <VersionStatus />
                </div>
                <div className="pr-1">
                  <LinkContainer
                    activeClassName="active"
                    to={routes.GENSETTINGS}
                  >
                    <Button size="sm" variant="outline-dark" title="Settings">
                      <i className="fa fa-cogs" />
                    </Button>
                  </LinkContainer>
                </div>
                <div className="pt-2 p-0 pr-0">
                  <DbStatus />
                </div>
                <div className="pt-2 pr-0 mr-4">
                  <PingStatus />
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default withRouter(Navbar);
