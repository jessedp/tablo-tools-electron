import { withRouter } from 'react-router-dom';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { Container } from 'react-bootstrap';
import routes from '../constants/routes.json';
import SettingsGeneral from '../components/SettingsGeneral';
import SettingsAdvanced from '../components/SettingsAdvanced';
import SettingsNaming from '../components/SettingsNaming';
import SettingsExport from '../components/SettingsExport';

type Props = {
  location: any;
};

function SettingsPage(props: Props) {
  const { location } = props;
  let content = <SettingsGeneral />;

  switch (location.pathname) {
    case routes.ADVSETTINGS:
      content = <SettingsAdvanced />;
      break;

    case routes.FILENAMETPLs:
      content = <SettingsNaming />;
      break;

    case routes.EXPSETTINGS:
      content = <SettingsExport />;
      break;

    default:
  }

  return (
    <Container className="section">
      <div>
        <Alert variant="primary" className="p-2">
          <Row>
            <Col md="2" className="pt-2">
              <h4 className="pl-2">Settings</h4>
            </Col>
            <Col>
              <ButtonGroup className="pt-1">
                <LinkContainer activeClassName="active" to={routes.GENSETTINGS}>
                  <Button size="sm" variant="light" as="button" title="General">
                    General
                  </Button>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.EXPSETTINGS}>
                  <Button size="sm" variant="light" as="button" title="Export">
                    Export
                  </Button>
                </LinkContainer>
                <LinkContainer
                  activeClassName="active"
                  to={routes.FILENAMETPLs}
                >
                  <Button size="sm" variant="light" as="button" title="Naming">
                    Naming
                  </Button>
                </LinkContainer>
                <LinkContainer activeClassName="active" to={routes.ADVSETTINGS}>
                  <Button
                    size="sm"
                    variant="light"
                    as="button"
                    title="Advanced"
                  >
                    Advanced
                  </Button>
                </LinkContainer>
              </ButtonGroup>
            </Col>
          </Row>
        </Alert>
        <Row>
          <Col />
        </Row>
      </div>

      <div className="scrollable-area">{content}</div>
    </Container>
  );
}

export default withRouter(SettingsPage);
