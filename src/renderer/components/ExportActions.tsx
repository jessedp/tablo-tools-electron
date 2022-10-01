import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { Alert } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

import {
  EXP_WORKING,
  DUPE_SKIP,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_ADDID,
} from '../constants/app';

import Checkbox from './Checkbox';

export default function ExportActions(prop: Record<string, any>) {
  const {
    state,
    cancel,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggleDOF,
    actionOnDuplicate,
    setActionOnDuplicate,
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Alert variant="primary" className="p-2 m-2">
        <Row>
          <Col md="5" />
          <Col md="2">
            <Button variant="warning" onClick={cancel}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Alert>
    );
  }

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Alert variant="primary" className="p-2 m-2">
      <Row>
        <Col md="4" className="pt-2">
          <h4 className="pl-2">Export Recordings</h4>
        </Col>
        <Col md="auto">
          <InputGroup size="sm" className="pt-1">
            <InputGroup.Prepend>
              <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
                <span className="fa fa-info pr-2" />
                Max:
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              as="select"
              value={atOnce}
              aria-describedby="btnState"
              onChange={atOnceChange}
              title="More than 2 is probably silly, but YOLO!"
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </Form.Control>
          </InputGroup>
        </Col>
        <Col md="auto">
          <Button variant="light" onClick={process} className="mr-2">
            Export
          </Button>
        </Col>
        <Col md="auto" className="pt-2">
          <Checkbox
            checked={deleteOnFinish}
            handleChange={toggleDOF}
            label="Delete when finished?"
          />
        </Col>
        <Col md="auto">
          <InputGroup size="sm" className="pt-1">
            <InputGroup.Prepend>
              <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
                <span className="fa fa-info pr-2" />
                On duplicate:
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              as="select"
              value={actionOnDuplicate}
              aria-describedby="btnState"
              onChange={setActionOnDuplicate}
              title="Override the global duplicte setting"
            >
              <option value={DUPE_INC}>{DUPE_INC.toLowerCase()}</option>
              <option value={DUPE_OVERWRITE}>
                {DUPE_OVERWRITE.toLowerCase()}
              </option>
              <option value={DUPE_ADDID}>add id</option>
              <option value={DUPE_SKIP}>{DUPE_SKIP.toLowerCase()}</option>
            </Form.Control>
          </InputGroup>
        </Col>{' '}
      </Row>
    </Alert>
  );
}
