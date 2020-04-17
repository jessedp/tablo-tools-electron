// @flow
import React, { Component } from 'react';
import os from 'os';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Api from '../utils/Tablo';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

type Props = {};
type State = {
  state: number,
  enableServerInfo: number,
  enableRecordings: number,
  serverInfoStatus: any,
  recordingStatus: any
};

const STATE_WAITING = 0;
const STATE_WORKING = 1;
const STATE_COMPLETE = 2;
const STATE_ERROR = 3;

export default class ExportData extends Component<Props, State> {
  props: Props;

  shouldCancel: boolean;

  constructor() {
    super();

    this.shouldCancel = false;
    this.state = {
      state: STATE_WAITING,
      enableServerInfo: CHECKBOX_ON,
      enableRecordings: CHECKBOX_ON,
      serverInfoStatus: '',
      recordingStatus: ''
    };

    (this: any).startExport = this.startExport.bind(this);
    (this: any).cancelExport = this.cancelExport.bind(this);
    (this: any).toggleServerInfo = this.toggleServerInfo.bind(this);
    (this: any).toggleRecordings = this.toggleRecordings.bind(this);
  }

  toggleServerInfo = () => {
    const { enableServerInfo } = this.state;
    this.setState({
      enableServerInfo:
        enableServerInfo === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF
    });
  };

  toggleRecordings = () => {
    const { enableRecordings } = this.state;
    this.setState({
      enableRecordings:
        enableRecordings === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF
    });
  };

  cancelExport = () => {
    this.shouldCancel = true;
    this.setState({ state: STATE_WAITING });
  };

  startExport = async () => {
    const { enableServerInfo, enableRecordings } = this.state;

    this.shouldCancel = false;

    this.setState({ state: STATE_WORKING });

    if (enableServerInfo === CHECKBOX_OFF && !enableRecordings === CHECKBOX_OFF)
      return;

    const bail = msg => {
      console.log(msg);
      this.setState({
        state: STATE_ERROR,
        serverInfoStatus: '',
        recordingStatus: ''
      });
    };

    const tmpDir = path.join(os.tmpdir(), 'tablo-tools-export');
    try {
      // $FlowFixMe guessing this means I don't have the proper node version somewhere
      fs.rmdirSync(tmpDir, { recursive: true });
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch (e) {
      return bail(e);
    }
    // need it for the file name, so...
    const info = await Api.getServerInfo();
    delete info.private_ip;
    const filename = `${info.server_id}_Export.zip`;
    const tmpFile = path.join(tmpDir, filename);

    // Setup the zip archive
    const output = fs.createWriteStream(tmpFile);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    archive.pipe(output);

    // warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.warn('archive', err);
      } else {
        return bail(err);
      }
    });
    archive.on('error', err => {
      return bail(err);
    });

    if (enableServerInfo === CHECKBOX_ON) {
      archive.append(JSON.stringify(info), { name: 'server-info.json' });
      this.setState({
        serverInfoStatus: (
          <span>
            <span className="fa fa-check-circle" />
          </span>
        )
      });
    }

    if (enableRecordings === CHECKBOX_ON) {
      this.setState({
        recordingStatus: (
          <span>
            <span className="fa fa-spinner" />
          </span>
        )
      });
      const total = await Api.getRecordings({ countOnly: true, force: true });
      let done = 0;
      const updateTotal = num => {
        this.setState({ recordingStatus: `${num} / ${total}` });
      };
      updateTotal(done);

      const recs = await Api.getRecordings({
        callback: val => {
          done += 1;
          updateTotal(val);
        }
      });

      // TODO: maybe put these files elsewhere later
      recs.forEach(rec => {
        archive.append(JSON.stringify(rec), {
          name: `airings/airing-${rec.object_id}.json`
        });
      });

      this.setState({
        recordingStatus: (
          <span>
            <span className="fa fa-check-circle" />
          </span>
        )
      });
    }

    // this will trigger out.on('close')
    archive.finalize();
    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    // output.on('close', async () => {
    //   console.log(`${archive.pointer()} total bytes`);
    //   console.log(
    //     'archiver has been finalized and the output file descriptor has closed.'
    //   );
    // });

    /** Now actually upload * */
    const signUrl =
      'https://8xd9zweji2.execute-api.us-east-1.amazonaws.com/TT_PresignedURL';

    let resp = {};
    try {
      resp = await axios.get(`${signUrl}?name=${filename}`);
    } catch (e) {
      return bail(`getting signed url: ${e}`);
    }
    if (!resp.data) {
      return bail(`resp missing? ${resp}`);
    }
    const { url } = resp.data.url;
    const { fields } = resp.data.url;

    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      formData.append(k, v);
    });

    const buffer = fs.readFileSync(tmpFile);
    const blob = new Blob([buffer]);

    formData.append('file', blob);

    axios({
      method: 'post',
      url,
      data: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .then(() => {
        setTimeout(() => this.setState({ state: STATE_WAITING }), 3000);
        return this.setState({
          state: STATE_COMPLETE,
          serverInfoStatus: '',
          recordingStatus: ''
        });
      })
      .catch(err => {
        bail(err.response.data);
      });
  };

  render() {
    const {
      state,
      enableServerInfo,
      enableRecordings,
      serverInfoStatus,
      recordingStatus
    } = this.state;

    return (
      <div className="border p-1 mb-3 mt-3" style={{ width: '350px' }}>
        <Row>
          <Col md="8">
            <h5>Send Device Data</h5>
          </Col>
          <Col md="4">
            <ExportButton
              state={state}
              startExport={this.startExport}
              cancelExport={this.cancelExport}
            />
          </Col>
        </Row>

        <Row>
          <Col md="8">
            <div className="d-flex flex-row">
              <div className="p-1">
                <Checkbox
                  checked={enableServerInfo}
                  handleChange={this.toggleServerInfo}
                />
              </div>
              <div className="p-1">Server Info</div>
              <div className="p-1">{serverInfoStatus}</div>
            </div>
            <div className="d-flex flex-row">
              <div className="p-1">
                <Checkbox
                  checked={enableRecordings}
                  handleChange={this.toggleRecordings}
                />
              </div>
              <div className="p-1">Recordings</div>
              <div className="p-1">{recordingStatus}</div>
            </div>
          </Col>
          <Col md="4" className="pt-4">
            <Status state={state} />
          </Col>
        </Row>
      </div>
    );
  }
}
function Status(prop) {
  const { state } = prop;
  if (state === STATE_WORKING)
    return <Spinner animation="grow" variant="info" />;
  if (state === STATE_COMPLETE) return <Alert variant="success">Thanks!</Alert>;
  return '';
}

function ExportButton(prop) {
  const { state, startExport, cancelExport } = prop;
  if (state === STATE_WORKING) {
    return (
      <Button
        size="sm"
        variant="outline-warning"
        type="button"
        onClick={cancelExport}
      >
        Cancel
      </Button>
    );
  }

  if (state === STATE_ERROR) {
    return (
      <Button
        size="sm"
        variant="outline-danger"
        type="button"
        onClick={startExport}
      >
        Try again?
      </Button>
    );
  }

  // STATE_WAITING
  return (
    <Button
      size="sm"
      variant="outline-primary"
      type="button"
      onClick={startExport}
    >
      Start
    </Button>
  );
}
