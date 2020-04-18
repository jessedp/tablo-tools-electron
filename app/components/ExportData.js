// @flow
import React, { Component } from 'react';
import { shell } from 'electron';
import os from 'os';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import Alert from 'react-bootstrap/Alert';
import Api from '../utils/Tablo';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

type Props = {};
type State = {
  state: number,
  enableServerInfo: boolean,
  enableRecordings: boolean,
  serverInfoStatus: any,
  recordingStatus: any,
  fileFullPath: string
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
      enableServerInfo: true,
      enableRecordings: true,
      serverInfoStatus: '',
      recordingStatus: '',
      fileFullPath: ''
    };

    (this: any).startExport = this.startExport.bind(this);
    (this: any).cancelExport = this.cancelExport.bind(this);
    (this: any).toggleServerInfo = this.toggleServerInfo.bind(this);
    (this: any).toggleRecordings = this.toggleRecordings.bind(this);
    (this: any).openExportFile = this.openExportFile.bind(this);
  }

  toggleServerInfo = () => {
    const { enableServerInfo } = this.state;
    this.setState({ enableServerInfo: !enableServerInfo });
  };

  toggleRecordings = () => {
    const { enableRecordings } = this.state;
    this.setState({ enableRecordings: !enableRecordings });
  };

  cancelExport = () => {
    this.shouldCancel = true;
    this.setState({ state: STATE_WAITING });
  };

  openExportFile = () => {
    const { fileFullPath } = this.state;
    if (!fileFullPath) return;
    shell.showItemInFolder(fileFullPath);
  };

  startExport = async (upload: boolean = true) => {
    const { enableServerInfo, enableRecordings } = this.state;

    this.shouldCancel = false;

    this.setState({ state: STATE_WORKING });

    if (!enableServerInfo && !enableRecordings) return;

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

    if (enableServerInfo) {
      archive.append(JSON.stringify(info, null, 2), {
        name: 'server-info.json'
      });
      this.setState({
        serverInfoStatus: (
          <span>
            <span className="fa fa-check-circle text-success" />
          </span>
        )
      });
    }

    if (enableRecordings) {
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
        archive.append(JSON.stringify(rec, null, 2), {
          name: `airings/airing-${rec.object_id}.json`
        });
      });

      this.setState({
        recordingStatus: (
          <span>
            <span className="fa fa-check-circle text-success" />
          </span>
        )
      });
    }

    // this will trigger out.on('close')
    archive.finalize();

    this.setState({
      state: STATE_COMPLETE,
      serverInfoStatus: '',
      recordingStatus: '',
      fileFullPath: tmpFile
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    // output.on('close', async () => {
    //   console.log(`${archive.pointer()} total bytes`);
    //   console.log(
    //     'archiver has been finalized and the output file descriptor has closed.'
    //   );
    // });

    if (!upload) {
      return;
    }

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
      // $FlowFixMe ugh. maybe later.
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
          recordingStatus: '',
          fileFullPath: tmpFile
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
      recordingStatus,
      fileFullPath
    } = this.state;

    return (
      <div className="p-1 mb-3 mt-1">
        <Row>
          <Col md="3">
            <h5>Submit Device Data</h5>
          </Col>
          <Col md="auto" />
        </Row>
        <Row>
          <Col>
            <b>About: </b>
            <ul>
              <li>
                The only data being sent is about the current Tablo device.
              </li>
              <li>
                Your <i>public_ip</i> (and anything else that looks personal)
                will never be sent.
              </li>
              <li>The data is not and will not be public.</li>
              <li>
                This is an open source project. Anyone can look at the code to
                verify the data being sent (See <code>Help -&gt; About</code>{' '}
                menu)
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Alert variant="warning">
              It&apos;s pretty pointless to do this unless we ask for it...
            </Alert>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Row className="mt-1">
              <Col md="5">
                <Checkbox
                  checked={enableServerInfo ? CHECKBOX_ON : CHECKBOX_OFF}
                  handleChange={this.toggleServerInfo}
                  label="Server Info"
                />
              </Col>
              <Col md="auto">{serverInfoStatus}</Col>
            </Row>
            <Row>
              <Col md="5">
                <Checkbox
                  checked={enableRecordings ? CHECKBOX_ON : CHECKBOX_OFF}
                  handleChange={this.toggleRecordings}
                  label="Recordings"
                />
              </Col>
              <Col md="auto">{recordingStatus}</Col>
            </Row>
          </Col>
          <Col md="auto">
            <ExportButton
              state={state}
              buildExport={() => this.startExport(false)}
              startExport={this.startExport}
              cancelExport={this.cancelExport}
            />
          </Col>
        </Row>
        <Row>
          <Col md="7">
            <InputGroup className="">
              <InputGroup.Prepend>
                <Form.Label
                  className="pt-2 bg-light pb-1 pr-1 pl-1 border"
                  style={{ width: '110px' }}
                >
                  Export file
                </Form.Label>
              </InputGroup.Prepend>
              <Form.Control
                type="text"
                value={fileFullPath}
                placeholder="not generated"
                style={{ width: '350px' }}
                onChange={() => {}}
              />
              <InputGroup.Append>
                <Button
                  style={{ height: '35px' }}
                  size="xs"
                  variant="outline-secondary"
                  onClick={this.openExportFile}
                >
                  <span>Open</span>
                </Button>
              </InputGroup.Append>
            </InputGroup>
            <span className="smaller">
              The zip file will contain <code>.json</code> files. They are text
              files if you want to take a look.
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

function ExportButton(prop) {
  const { state, buildExport, startExport } = prop;
  // , cancelExport

  if (state === STATE_WORKING) {
    return <Spinner animation="grow" variant="info" />;
    // return (
    //   <Button
    //     size="sm"
    //     variant="outline-warning"
    //     type="button"
    //     onClick={cancelExport}
    //   >
    //     Cancel
    //   </Button>
    // );
  }

  if (state === STATE_COMPLETE) {
    return (
      <Button as="div" size="sm" variant="success">
        Thanks!
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
    <>
      <Button
        size="sm"
        variant="outline-primary"
        type="button"
        onClick={buildExport}
        className="mr-2"
      >
        Build and Review
      </Button>

      <Button
        size="sm"
        variant="outline-danger"
        type="button"
        onClick={startExport}
      >
        Upload
      </Button>
    </>
  );
}
