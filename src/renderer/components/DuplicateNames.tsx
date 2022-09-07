import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

import { Row, Col, Alert } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

import Airing from '../utils/Airing';
import Filename from './Filename';

type Props = {
  files: Record<string, any>;
  total: number;
};
export default function DuplicateNames(props: Props) {
  const { files, total } = props;
  const [show, setShow] = useState(false);

  if (!show) {
    const status = `${
      total - Object.keys(files).length
    } / ${total}* are duplicates`;
    return (
      <Button
        variant="warning"
        onClick={() => setShow(true)}
        size={'xs' as any}
        className="ml-2"
      >
        <span className="fas fa-exclamation mr-2 naming-icons" />
        {status}
      </Button>
    );
  }

  type DupeRec = { file: string; airings: Airing[] };
  const dupes: DupeRec[] = [];

  Object.keys(files).forEach((file) => {
    // console.log(file, files[file].length);
    if (files[file].length > 1) {
      dupes.push({
        file,
        airings: files[file],
      });
    }
  });
  // console.log('2', dupes);
  dupes.sort((a, b) => (a.airings.length > b.airings.length ? -1 : 1));
  return (
    <Modal show={show} scrollable onHide={() => setShow(false)} size="lg">
      <Modal.Header closeButton>
        <Alert variant="warning" className="mb-0">
          {total - Object.keys(files).length} / {total} are duplicates
          <span className="smaller pl-2">(max 1000)</span>
        </Alert>
      </Modal.Header>
      <Modal.Body>
        <Row className="border-bottom mb-2">
          <Col md="1" className="bold">
            #
          </Col>
          <Col className="bold">duplicate filename</Col>
        </Row>

        {dupes.map((rec) => {
          return (
            <Filename file={rec.file} airings={rec.airings} key={rec.file} />
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
