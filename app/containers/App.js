// @flow
import * as React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Sidebar from '../components/Sidebar';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <Container style={{ width: '100%', maxWidth: '100%' }} className="m-0">
          <Row>
            <Col className="ml-0 pl-0">
              <Sidebar />
            </Col>
          </Row>
          <Row>
            <Col>{children}</Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}
