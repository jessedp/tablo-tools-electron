// @flow
import { shell } from 'electron';
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
        title="Info"
        className="ml-2"
      >
        <span className="fa fa-info-circle" />
      </Button>
    );
  }

  const selectJson = (node: Object) => {
    if (node.name.includes('path')) {
      console.log(node);
      const host = global.Api.device.private_ip;
      const url = `http://${host}:8885/${node.value}`;
      shell.openExternal(url);
    }
  };

  const directoryUrl = `http://192.168.1.229:18080/pvr/${airing.id}/`;
  const openDirectory = () => {
    shell.openExternal(directoryUrl);
  };

  // eslint-disable-next-line no-underscore-dangle
  delete airing.data._id;

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
        <Button
          variant="link"
          onClick={openDirectory}
          className="text-lowercase external-directory pt-0"
        >
          <span className="fa fa-globe pr-2" />
          {directoryUrl}
        </Button>
        <Alert size="sm" variant="dark" className="p-1 pl-2">
          JSON data
          <span className="pl-2 smaller">
            (click any <i>path</i> to open it in the browser)
          </span>
        </Alert>

        <ReactJson
          src={airing.data}
          enableClipboard
          collapsed={0}
          displayDataTypes
          onSelect={selectJson}
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
