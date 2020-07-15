// @flow
import { shell } from 'electron';
import React, { useState } from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Alert } from 'react-bootstrap';

import ReactJson from 'react-json-view';
import { ON } from '../constants/app';
import RecordingOverview from './RecordingOverview';
import Airing from '../utils/Airing';
import RecordingMini from './RecordingMini';

type Props = { airing: Airing };

export default function AiringDetailsModal(props: Props) {
  const { airing } = props;
  const [show, setShow] = useState(false);
  const [details, setExportDetails] = useState([]);
  const [watchUrl, setWatchUrl] = useState('');

  const loadExportDetails = async () => {
    const info = airing.getExportDetails();
    setExportDetails(info);
    const url = await airing.watch();
    setWatchUrl(url.playlist_url);
  };

  if (!show) {
    return (
      <Button
        variant="outline-secondary"
        onClick={() => setShow(true)}
        size="xs"
        title="Info"
        className=""
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
        <Alert
          variant="secondary"
          className="mb-0 md-col-7"
          style={{ width: '100%', fontSize: '18px' }}
        >
          {airing.showTitle}
        </Alert>
      </Modal.Header>
      <Modal.Body>
        <RecordingMini airing={airing} withShow={ON} withSelect={ON} />
        <RecordingOverview airing={airing} />
        <div className="text-lowercase text-info ml-2 pl-1 pt-0 d-block">
          <span className="fa fa-tv pr-2" />
          {watchUrl}
        </div>
        <div className="text-black-50 smaller ml-5">
          Watch URLs will change on every load
        </div>
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
