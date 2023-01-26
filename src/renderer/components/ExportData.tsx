import { Component } from 'react';
// import { shell } from 'electron';
// import os from 'os';
// import archiver from 'archiver';
// import axios from 'axios';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
// import Spinner from 'react-bootstrap/Spinner';
// import InputGroup from 'react-bootstrap/InputGroup';
// import Form from 'react-bootstrap/Form';
// import Alert from 'react-bootstrap/Alert';

// import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

// const { archiver } = window.electron;

// const { shell } = window.electron;

type Props = Record<string, never>;
type State = {
  // state: number;
  enableServerInfo: boolean;
  enableRecordings: boolean;
  // serverInfoStatus: any;
  // recordingStatus: any;
  fileFullPath: string;
};
// const STATE_WAITING = 0;
// const STATE_WORKING = 1;
// const STATE_COMPLETE = 2;
// const STATE_ERROR = 3;
export default class ExportData extends Component<Props, State> {
  // shouldCancel: boolean;

  constructor(props: Props) {
    super(props);
    // this.shouldCancel = false;
    this.state = {
      // state: STATE_WAITING,
      enableServerInfo: true,
      enableRecordings: true,
      // serverInfoStatus: '',
      // recordingStatus: '',
      fileFullPath: '',
    };
    // (this as any).startExport = this.startExport.bind(this);
    // (this as any).cancelExport = this.cancelExport.bind(this);
    (this as any).toggleServerInfo = this.toggleServerInfo.bind(this);
    (this as any).toggleRecordings = this.toggleRecordings.bind(this);
    (this as any).openExportFile = this.openExportFile.bind(this);
    (this as any).causeError = this.causeError.bind(this);
    (this as any).causeError2 = this.causeError2.bind(this);
    (this as any).causeError3 = this.causeError3.bind(this);
  }

  toggleServerInfo = () => {
    const { enableServerInfo } = this.state;
    this.setState({
      enableServerInfo: !enableServerInfo,
    });
  };

  toggleRecordings = () => {
    const { enableRecordings } = this.state;
    this.setState({
      enableRecordings: !enableRecordings,
    });
  };

  // cancelExport = () => {
  //   this.shouldCancel = true;
  //   this.setState({
  //     state: STATE_WAITING,
  //   });
  // };

  openExportFile = () => {
    const { fileFullPath } = this.state;
    if (!fileFullPath) return;
    window.ipcRenderer.send('open-path', fileFullPath);
  };

  // startExport = async (upload = true) => {
  //   const { enableServerInfo, enableRecordings } = this.state;
  //   this.shouldCancel = false;
  //   this.setState({
  //     state: STATE_WORKING,
  //   });
  //   if (!enableServerInfo && !enableRecordings) return;

  //   const bail = (msg: string) => {
  //     console.log(msg);
  //     this.setState({
  //       state: STATE_ERROR,
  //       serverInfoStatus: '',
  //       recordingStatus: '',
  //     });
  //   };

  //   const tmpDir = window.path.join(window.os.tmpdir(), 'tablo-tools-export');

  //   try {
  //     // $FlowFixMe guessing this means I don't have the proper node version somewhere
  //     fs.rmdirSync(tmpDir, {
  //       recursive: true,
  //     });
  //     fs.mkdirSync(tmpDir, {
  //       recursive: true,
  //     });
  //   } catch (e) {
  //     bail(`${e}`);
  //   }

  //   // need it for the file name, so...
  //   const info = await Api.getServerInfo();
  //   // get rid of personal data
  //   delete info.public_ip;
  //   delete info.http;
  //   delete info.slip;
  //   const filename = `${info.server_id}_Export.zip`;
  //   const tmpFile = window.path.join(tmpDir, filename);
  //   // Setup the zip archive
  //   const output = fs.createWriteStream(tmpFile);
  //   const archive = archiver('zip', {
  //     zlib: {
  //       level: 9,
  //     }, // Sets the compression level.
  //   });
  //   archive.pipe(output);
  //   // warnings (ie stat failures and other non-blocking errors)
  //   archive.on('warning', (err) => {
  //     if (err.code === 'ENOENT') {
  //       console.warn('archive', err);
  //       return '';
  //     }
  //     return bail(err.toString());
  //   });

  //   archive.on('error', (err) => {
  //     return bail(err.toString());
  //   });

  //   if (enableServerInfo) {
  //     archive.append(JSON.stringify(info, null, 2), {
  //       name: 'server-info.json',
  //     });
  //     this.setState({
  //       serverInfoStatus: (
  //         <span>
  //           <span className="fa fa-check-circle text-success" />
  //         </span>
  //       ),
  //     });
  //   }

  //   if (enableRecordings) {
  //     this.setState({
  //       recordingStatus: (
  //         <span>
  //           <span className="fa fa-spinner" />
  //         </span>
  //       ),
  //     });
  //     const total = await Api.getRecordingsCount();
  //     let done = 0;

  //     const updateTotal = (num: number | string) => {
  //       this.setState({
  //         recordingStatus: `${num} / ${total.length}`,
  //       });
  //     };

  //     updateTotal(done);
  //     const recs = await Api.getRecordings(true, (val: string) => {
  //       done += 1;
  //       updateTotal(val);
  //     });
  //     // TODO: maybe put these files elsewhere later
  //     recs.forEach((rec: Record<string, any>) => {
  //       archive.append(JSON.stringify(rec, null, 2), {
  //         name: `airings/airing-${rec.object_id}.json`,
  //       });
  //     });
  //     this.setState({
  //       recordingStatus: (
  //         <span>
  //           <span className="fa fa-check-circle text-success" />
  //         </span>
  //       ),
  //     });
  //   }

  //   // this will trigger out.on('close')
  //   archive.finalize();
  //   this.setState({
  //     state: STATE_COMPLETE,
  //     serverInfoStatus: '',
  //     recordingStatus: '',
  //     fileFullPath: tmpFile,
  //   });

  //   // listen for all archive data to be written
  //   // 'close' event is fired only when a file descriptor is involved
  //   // output.on('close', async () => {
  //   //   console.log(`${archive.pointer()} total bytes`);
  //   //   console.log(
  //   //     'archiver has been finalized and the output file descriptor has closed.'
  //   //   );
  //   // });
  //   if (!upload) {
  //     return;
  //   }

  //   /** Now actually upload * */
  //   const signUrl =
  //     'https://8xd9zweji2.execute-api.us-east-1.amazonaws.com/TT_PresignedURL';
  //   let resp;

  //   try {
  //     resp = await axios.get(`${signUrl}?name=${filename}`);
  //   } catch (e) {
  //     bail(`getting signed url: ${e}`);
  //     return;
  //   }

  //   if (!resp.data) {
  //     bail(`resp missing? ${resp}`);
  //     return;
  //   }

  //   const { url } = resp.data.url;
  //   const { fields } = resp.data.url;
  //   const formData = new FormData();
  //   Object.entries(fields).forEach(([k, v]) => {
  //     // FIXME! or test me? forced string may not work...
  //     formData.append(k, `${v}`);
  //   });
  //   const buffer = fs.readFileSync(tmpFile);
  //   const blob = new Blob([buffer]);
  //   formData.append('file', blob);
  //   axios({
  //     method: 'post',
  //     url,
  //     data: formData,
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //   })
  //     .then(() => {
  //       setTimeout(
  //         () =>
  //           this.setState({
  //             state: STATE_WAITING,
  //           }),
  //         3000
  //       );
  //       return this.setState({
  //         state: STATE_COMPLETE,
  //         serverInfoStatus: '',
  //         recordingStatus: '',
  //         fileFullPath: tmpFile,
  //       });
  //     })
  //     .catch((err) => {
  //       bail(err.response.data);
  //     });
  // };

  causeError = () => {
    // "hidden" and allows causing an error in prod

    throw new Error('causeError 1!');
  };

  causeError2 = () => {
    // "hidden" and allows causing an error in prod

    throw new Error('causeError 2!');
  };

  causeError3 = () => {
    // "hidden" and allows causing an Ignored error in prod

    throw new Error('causeError 3!');
  };

  render() {
    // const {
    //   state,
    //   enableServerInfo,
    //   enableRecordings,
    //   serverInfoStatus,
    //   recordingStatus,
    //   fileFullPath,
    // } = this.state;
    return (
      <div className="p-1 mb-3 mt-3">
        <Row>
          <Col>
            {/* <Row>
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
          <Col md="8">
            <Alert variant="light">
              <ul className="ml-0 pl-2">
                <li>
                  <b>Build &amp; Review</b> - creates the zip file to be
                  uploaded so you can see what&apos;s being sent.
                </li>
                <li>
                  <b>Upload</b> - creates and uploads the zip file
                </li>
              </ul>
              It&apos;s pretty pointless to do this unless we ask for it...
            </Alert>
          </Col>
        </Row>
        <Row>
          <Col md="6">
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
                  style={{
                    width: '110px',
                  }}
                >
                  Export file
                </Form.Label>
              </InputGroup.Prepend>
              <Form.Control
                type="text"
                value={fileFullPath}
                placeholder="not generated"
                style={{
                  width: '350px',
                }}
                onChange={() => undefined}
              />
              <InputGroup.Append>
                <Button
                  style={{
                    height: '35px',
                  }}
                  size={'xs' as any}
                  variant="outline-secondary"
                  onClick={this.openExportFile}
                >
                  <span>Open</span>
                </Button>
              </InputGroup.Append>
            </InputGroup>
            <span className="smaller">
              The zip file will contain <code>.json</code> files. They are plain
              text files if you want to take a look.
            </span> */}
            <Button
              size={'xs' as any}
              className="ml-5"
              variant="white"
              onClick={this.causeError}
              title="purposefully cause a bogus error in production to test reporting... #1"
            >
              &nbsp;
            </Button>

            <Button
              size={'xs' as any}
              className="ml-5"
              variant="white"
              onClick={this.causeError2}
              title="purposefully cause a bogus error in production to test reporting... #2"
            >
              &nbsp;
            </Button>

            <Button
              size={'xs' as any}
              className="ml-5"
              variant="white"
              onClick={this.causeError3}
              title="purposefully cause a bogus error in production that will not be reported"
            >
              &nbsp;
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

// function ExportButton(prop: Record<string, any>) {
//   const { state, buildExport, startExport } = prop;

//   // , cancelExport
//   if (state === STATE_WORKING) {
//     return <Spinner animation="grow" variant="info" />; // return (
//     //   <Button
//     //     size="sm"
//     //     variant="outline-warning"
//     //     type="button"
//     //     onClick={cancelExport}
//     //   >
//     //     Cancel
//     //   </Button>
//     // );
//   }

//   if (state === STATE_COMPLETE) {
//     return (
//       <Button as="div" size="sm" variant="success">
//         Thanks!
//       </Button>
//     );
//   }

//   if (state === STATE_ERROR) {
//     return (
//       <Button
//         size="sm"
//         variant="outline-danger"
//         type="button"
//         onClick={startExport}
//       >
//         Try again?
//       </Button>
//     );
//   }

//   // STATE_WAITING
//   return (
//     <>
//       <Button
//         size="sm"
//         variant="outline-primary"
//         type="button"
//         onClick={buildExport}
//         className="mr-2"
//       >
//         Build and Review
//       </Button>

//       <Button
//         size="sm"
//         variant="outline-danger"
//         type="button"
//         onClick={startExport}
//       >
//         Upload
//       </Button>
//     </>
//   );
// }
