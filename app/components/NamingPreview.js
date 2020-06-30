// @flow
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Row, Col, Alert } from 'react-bootstrap';

import RecordingSlim from './RecordingSlim';
import { ON, OFF } from '../constants/app';

type Props = { files: Object };

export default function NamingPreview(props: Props) {
  const { files } = props;
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <Button
        variant="outline-info"
        onClick={() => setShow(true)}
        className="ml-2"
        size="xs"
        title="preview"
      >
        <span className="fa fa-search" />
      </Button>
    );
  }
  const recs = [];
  Object.keys(files).forEach(file => {
    files[file].forEach(airing => {
      recs.push({ file, airing });
    });
  });

  recs.sort((a, b) => {
    return a.airing.airingDetails.datetime > b.airing.airingDetails.datetime
      ? -1
      : 1;
  });

  return (
    <Modal show={show} scrollable onHide={() => setShow(false)} size="lg">
      <Modal.Header closeButton>
        <Alert variant="primary" className="mb-0">
          {recs.length} records
        </Alert>
      </Modal.Header>
      <Modal.Body>
        {recs.map(rec => {
          return (
            <Filename
              file={rec.file}
              airing={rec.airing}
              key={`preview-${rec.airing.id}`}
            />
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

const Filename = prop => {
  const { file, airing } = prop;
  const [show, setShow] = useState(false);

  const header = (
    <Row className="border-bottom mb-2">
      <Col>
        {show ? (
          <Button
            onClick={() => setShow(false)}
            variant="link"
            size="xs"
            title="Hide airing"
          >
            <span className="fa fa-toggle-on preview-toggle" />
          </Button>
        ) : (
          <Button
            onClick={() => setShow(true)}
            variant="link"
            size="xs"
            title="show airing"
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
      <RecordingSlim
        airing={airing}
        key={`preview-${airing.id}`}
        withSelect={ON}
        withActions={OFF}
      />
    </> //
  );
};
