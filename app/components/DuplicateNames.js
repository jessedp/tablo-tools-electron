// @flow
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Row, Col, Alert, Badge } from 'react-bootstrap';

import RecordingSlim from './RecordingSlim';
import { ON, OFF } from '../constants/app';

type Props = { files: Object, total: number };

export default function DuplicateNames(props: Props) {
  const { files, total } = props;
  const [show, setShow] = useState(false);

  if (!show) {
    const status = `${total -
      Object.keys(files).length} / ${total} are duplicates`;
    return (
      <Button
        variant="link"
        onClick={() => setShow(true)}
        className="text-white border-bottom"
        size="xs"
      >
        {status}
      </Button>
    );
  }
  const dupes = [];
  Object.keys(files).forEach(file => {
    // console.log(file, files[file].length);
    if (files[file].length > 1) {
      dupes.push({ file, airings: files[file] });
    }
  });

  // console.log('2', dupes);
  dupes.sort((a, b) => (a.airings.length > b.airings.length ? -1 : 1));

  return (
    <Modal show={show} scrollable onHide={() => setShow(false)} size="lg">
      <Modal.Header closeButton>
        <Alert variant="warning" className="mb-0">
          {total - Object.keys(files).length} / {total} are duplicates
        </Alert>
      </Modal.Header>
      <Modal.Body>
        <Row className="border-bottom mb-2">
          <Col md="1" className="bold">
            #
          </Col>
          <Col className="bold">duplicate filename</Col>
        </Row>

        {dupes.map(rec => {
          return <Filename file={rec.file} airings={rec.airings} />;
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

const Filename = prop => {
  const { file, airings } = prop;
  const [show, setShow] = useState(false);

  airings.sort((a, b) => {
    if (a.sortTitle === b.sortTitle) {
      return a.airingDetails.datetime > b.airingDetails.datetime ? -1 : 1;
    }
    return a.sortTitle > b.sortTitle ? -1 : 1;
  });

  const header = (
    <Row className="border-bottom mb-2">
      <Col md="1">
        <Badge pill variant="warning">
          {airings.length}
        </Badge>
      </Col>
      <Col>
        {show ? (
          <Button
            onClick={() => setShow(false)}
            variant="link"
            size="xs"
            title="Hide airings"
          >
            <span className="fa fa-toggle-on preview-toggle" />
          </Button>
        ) : (
          <Button
            onClick={() => setShow(true)}
            variant="link"
            size="xs"
            title="show airings"
          >
            <span className="fa fa-toggle-off preview-toggle" />
          </Button>
        )}
        <span className="ml-2">{file}</span>
      </Col>
    </Row>
  );

  if (!show) {
    return header;
  }

  return (
    <>
      {header}
      {airings.map(airing => {
        return (
          <RecordingSlim
            airing={airing}
            key={`preview-${airing.id}`}
            withSelect={ON}
            withActions={OFF}
          />
        );
      })}
    </> //
  );
};
