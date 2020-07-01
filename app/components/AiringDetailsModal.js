// @flow
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Alert } from 'react-bootstrap';

import ReactJson from 'react-json-view';
import { ON, OFF } from '../constants/app';
import RecordingOverview from './RecordingOverview';
import Airing from '../utils/Airing';
import RecordingSlim from './RecordingSlim';

type Props = { airing: Airing };

export default function AiringDetailsModal(props: Props) {
  const { airing } = props;
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <Button
        variant="outline-secondary"
        onClick={() => setShow(true)}
        size="xs"
        title="info"
        className="ml-2"
      >
        <span className="fa fa-info-circle" />
      </Button>
    );
  }

  return (
    <Modal show={show} scrollable onHide={() => setShow(false)} size="lg">
      <Modal.Header closeButton>
        <Alert variant="info" className="mb-0">
          {airing.showTitle}
        </Alert>
      </Modal.Header>
      <Modal.Body>
        <RecordingSlim
          airing={airing}
          withShow={ON}
          withSelect={ON}
          withActions={OFF}
        />
        <RecordingOverview airing={airing} />
        <ReactJson
          src={airing.data}
          enableClipboard
          collapsed={1}
          displayDataTypes
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
