import { useState } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

type Prop = {
  awards: Array<Record<string, any>>;
};
export default function AwardsModal(prop: Prop) {
  const [display, setDisplay] = useState(false);
  const { awards } = prop;
  const len = awards.length;
  if (len === 0)
    return (
      <>
        <b>Awards:</b>
        <Button
          variant="light"
          onClick={() => {}}
          className="ml-2 pb-0 pt-0"
          size={'xs' as any}
          title="Nothing, yet..."
        >
          None
        </Button>
      </>
    );

  //
  if (!display) {
    return (
      <>
        <b>Awards:</b>
        <Button
          variant="success"
          onClick={() => setDisplay(true)}
          className="ml-2 pb-0 pt-0"
          size={'xs' as any}
          title={`View the ${len} Awards`}
        >
          {len}
        </Button>
      </> //
    );
  }

  return (
    <Modal show={display} scrollable onHide={() => setDisplay(false)}>
      <Modal.Header closeButton>
        <Alert variant="success" className="mb-0">
          {len} Awards
        </Alert>
      </Modal.Header>
      <Modal.Body>
        {awards.map((rec) => {
          return (
            <>
              <Row>
                <Col>
                  <b className="mr-2">{rec.year}</b> {rec.name}
                  <i className="ml-2 font-weight-bold">{rec.nominee}</i>
                </Col>
              </Row>
              <Row className="border-bottom mb-2">
                <Col>
                  <i className="ml-2">{rec.category}</i>
                </Col>
              </Row>
            </> //
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setDisplay(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
