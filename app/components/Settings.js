// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import path from 'path';
import * as Sentry from '@sentry/electron';

// import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as FlashActions from '../actions/flash';
import type { FlashRecordType } from '../reducers/types';

import { isValidIp } from '../utils/utils';
import { discover } from '../utils/Tablo';
import getConfig, {
  ConfigType,
  setConfigItem,
  CONFIG_FILE_NAME
} from '../utils/config';
import ExportData from './ExportData';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import DurationPicker from './DurationPicker';

type Props = { sendFlash: (message: FlashRecordType) => void };

const { app, shell, dialog } = require('electron').remote;

class Settings extends Component<Props, ConfigType> {
  props: Props;

  constructor() {
    super();

    const storedState = getConfig();

    this.state = storedState;

    this.setEpisodePath = this.setEpisodePath.bind(this);
    this.setMoviePath = this.setMoviePath.bind(this);
    this.setEventPath = this.setEventPath.bind(this);
    this.setProgramPath = this.setProgramPath.bind(this);
    this.setPathDialog = this.setPathDialog.bind(this);

    this.toggleIpOverride = this.toggleIpOverride.bind(this);
    this.toggleAutoRebuild = this.toggleAutoRebuild.bind(this);
    this.toggleAutoUpdate = this.toggleAutoUpdate.bind(this);
    this.setAutoRebuildMinutes = this.setAutoRebuildMinutes.bind(this);
    this.toggleNotifyBeta = this.toggleNotifyBeta.bind(this);
    this.toggleErrorReport = this.toggleErrorReport.bind(this);
    this.setTestDeviceIp = this.setTestDeviceIp.bind(this);
    this.saveTestDeviceIp = this.saveTestDeviceIp.bind(this);

    this.toggleEnableDebug = this.toggleEnableDebug.bind(this);
    this.toggleDataExport = this.toggleDataExport.bind(this);
    this.setExportDataPath = this.setExportDataPath.bind(this);
  }

  setPathDialog = (field: string) => {
    const file = dialog.showOpenDialogSync({
      defaultPath: field,
      properties: ['openDirectory']
    });
    if (file) {
      const fields = {};
      // eslint-disable-next-line prefer-destructuring
      fields[field] = file[0];

      let type = '';
      switch (field) {
        case 'exportDataPath':
          type = 'Export Data';
          break;
        case 'episodePath':
          type = 'Episodes';
          break;
        case 'moviePath':
          type = 'Movies';
          break;
        case 'eventPath':
          type = 'Sports';
          break;
        case 'programPath':
        default:
          type = 'Sports';
      }
      const message = `${type} exports will appear in ${file[0]}`;
      const item = {};
      // eslint-disable-next-line prefer-destructuring
      item[field] = file[0];
      this.saveConfigItem(item, { message });
    }
  };

  /** This does the real work... */
  saveConfigItem = (item: Object, message: FlashRecordType) => {
    const { sendFlash } = this.props;

    this.setState(item);
    setConfigItem(item);
    sendFlash(message);
  };

  toggleAutoRebuild = () => {
    const { autoRebuild } = this.state;
    const message = `Auto-rebuild ${!autoRebuild ? 'enabled' : 'disabled'}`;
    const type = !autoRebuild ? 'success' : 'warning';
    this.saveConfigItem({ autoRebuild: !autoRebuild }, { message, type });
  };

  setAutoRebuildMinutes = (minutes: number | null) => {
    if (!minutes) return;
    const message = `DB Rebuild will happen every ${minutes} minutes`;
    this.saveConfigItem({ autoRebuildMinutes: minutes }, { message });
  };

  toggleAutoUpdate = () => {
    const { autoUpdate } = this.state;
    const message = `Automatic Updates are now ${
      !autoUpdate ? 'enabled' : 'disabled'
    }`;
    const type = !autoUpdate ? 'success' : 'warning';

    this.saveConfigItem({ autoUpdate: !autoUpdate }, { message, type });
  };

  toggleNotifyBeta = () => {
    const { notifyBeta } = this.state;
    const message = `Pre-release Notifications will  ${
      !notifyBeta ? '' : 'no longer'
    } be shown`;
    const type = !notifyBeta ? 'success' : 'warning';
    this.saveConfigItem({ notifyBeta: !notifyBeta }, { message, type });
  };

  toggleErrorReport = () => {
    const { allowErrorReport } = this.state;
    this.setState();

    const message = `Error Reporting is now ${
      !allowErrorReport ? 'enabled' : 'disabled'
    }`;
    const type = !allowErrorReport ? 'success' : 'warning';

    if (Sentry.getCurrentHub().getClient()) {
      Sentry.getCurrentHub()
        .getClient()
        .getOptions().enabled = !allowErrorReport;
    } else {
      console.error('Unable to set Sentry reporting value');
    }

    this.saveConfigItem(
      { allowErrorReport: !allowErrorReport },
      { message, type }
    );
  };

  setEpisodePath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ episodePath: event.currentTarget.value });
  };

  setMoviePath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ moviePath: event.currentTarget.value });
  };

  setEventPath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ eventPath: event.currentTarget.value });
  };

  setProgramPath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ programPath: event.currentTarget.value });
  };

  toggleIpOverride = () => {
    const { enableTestDevice } = this.state;

    const message = `Test Device ${!enableTestDevice ? 'enabled' : 'disabled'}`;
    const type = !enableTestDevice ? 'success' : 'warning';
    this.saveConfigItem(
      { enableTestDevice: !enableTestDevice },
      { message, type }
    );
  };

  saveTestDeviceIp = () => {
    const { sendFlash } = this.props;
    const { testDeviceIp } = this.state;
    if (!isValidIp(testDeviceIp)) {
      sendFlash({
        type: 'danger',
        message: `Invalid IP Address: ${testDeviceIp}`
      });
      return;
    }

    const message = `${testDeviceIp} set as Test Device!`;
    this.saveConfigItem({ testDeviceIp }, { message });
    discover();
  };

  setTestDeviceIp = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ testDeviceIp: event.currentTarget.value });
  };

  toggleDataExport = () => {
    const { enableExportData } = this.state;
    const message = `Data Export ${!enableExportData ? 'enabled' : 'disabled'}`;
    const type = !enableExportData ? 'success' : 'warning';
    this.saveConfigItem(
      { enableExportData: !enableExportData },
      { message, type }
    );
  };

  toggleEnableDebug = () => {
    const { enableDebug } = this.state;
    const message = `Debug logging ${!enableDebug ? 'enabled' : 'disabled'}`;
    const type = !enableDebug ? 'success' : 'warning';
    this.saveConfigItem({ enableDebug: !enableDebug }, { message, type });
  };

  setExportDataPath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ exportDataPath: event.currentTarget.value });
  };

  render() {
    const {
      // saveData,
      // saveState,
      autoRebuild,
      autoRebuildMinutes,
      autoUpdate,
      notifyBeta,
      allowErrorReport,
      enableTestDevice,
      testDeviceIp,
      enableExportData,
      exportDataPath,
      enableDebug,
      episodePath,
      moviePath,
      eventPath,
      programPath
    } = this.state;

    let logsPath = app.getPath('logs');

    // TODO: This has to be an Electron (8) bug
    //  Name (might) double up, so replace it
    const test = new RegExp(`${app.name}`, 'g');
    const mat = logsPath.match(test);
    if (mat && mat.length > 1) {
      for (let i = 1; i < mat.length; i += 1)
        logsPath = logsPath.replace(`${app.name}${path.sep}`, '');
    }

    const openLogs = () => {
      console.log(path.normalize(`${logsPath}/main.log`));
      shell.showItemInFolder(path.normalize(`${logsPath}/main.log`));
    };

    return (
      <div className="scrollable-area">
        <div>
          <div className="mt-3">
            <div>
              <Checkbox
                handleChange={this.toggleAutoRebuild}
                checked={autoRebuild ? CHECKBOX_ON : CHECKBOX_OFF}
                label="Enable automatically rebuilding local database?"
              />
              <DurationPicker
                value={autoRebuildMinutes}
                updateValue={this.setAutoRebuildMinutes}
                disabled={!autoRebuild}
              />
            </div>
          </div>

          <Row className="mt-3">
            <Col md="8">
              <Checkbox
                handleChange={this.toggleAutoUpdate}
                checked={autoUpdate ? CHECKBOX_ON : CHECKBOX_OFF}
                label="Enable automatic updates?"
              />
              <div className="pl-4 smaller">
                On Linux and Windows, try to automatically download and install{' '}
                <b>new releases</b>. Regardless of this setting, a notification
                will appear when a new release is available (or based on your
                choice below).
              </div>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Checkbox
                handleChange={this.toggleNotifyBeta}
                checked={notifyBeta ? CHECKBOX_ON : CHECKBOX_OFF}
                label="Show notification of pre-releases (beta, alpha, etc)?"
              />
              <div className="pl-4 smaller">
                Notifications will always be shown for full/normal releases that
                everyone will want. Windows and Linux will auto-update...
              </div>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md="8">
              <Checkbox
                handleChange={this.toggleErrorReport}
                label="Allow sending Error Reports?"
                checked={allowErrorReport ? CHECKBOX_ON : CHECKBOX_OFF}
              />
              <div className="pl-4 smaller">
                No personal data is collected - this simply notifies of us
                errors before you may post about it or even notice a problem. It
                does the <i>white screen of death</i> information gathering for
                you (and more).
              </div>
            </Col>
          </Row>

          <Row className="p-1 mt-3 mb-2">
            <Col md="7" className="pt-1 border bg-light">
              <h6 className="pt-1">Export Paths:</h6>
            </Col>
          </Row>

          <Directory
            label="Series/Episode"
            onClick={() => this.setPathDialog('episodePath')}
            onChange={this.setEpisodePath}
            value={episodePath}
            disabled={false}
          />
          <Directory
            label="Movie"
            onClick={() => this.setPathDialog('moviePath')}
            onChange={this.setMoviePath}
            value={moviePath}
            disabled={false}
          />
          <Directory
            label="Sport/Event"
            onClick={() => this.setPathDialog('eventPath')}
            onChange={this.setEventPath}
            value={eventPath}
            disabled={false}
          />
          <Directory
            label="Manual Recording"
            onClick={() => this.setPathDialog('programPath')}
            onChange={this.setProgramPath}
            value={programPath}
            disabled={false}
          />
          <br />

          <Row className="p-1 mb-2">
            <Col md="7" className="pt-1 border bg-light">
              <h6 className="pt-1">Advanced:</h6>
            </Col>
          </Row>

          <div style={{ width: '375px' }}>
            <Row>
              <Col>
                <Checkbox
                  handleChange={this.toggleIpOverride}
                  checked={enableTestDevice ? CHECKBOX_ON : CHECKBOX_OFF}
                  label="Enable Test Device?"
                />
              </Col>
            </Row>
            <Row className="m-0 p-0">
              <Col>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text title="Test Device IP address">
                      <span className="fa fa-network-wired pr-2" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    value={testDeviceIp}
                    type="text"
                    placeholder="Enter IP"
                    onChange={this.setTestDeviceIp}
                    onBlur={this.saveTestDeviceIp}
                    disabled={!enableTestDevice}
                  />
                </InputGroup>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <Checkbox
                  handleChange={this.toggleDataExport}
                  checked={enableExportData ? CHECKBOX_ON : CHECKBOX_OFF}
                  label="Export Tablo Data?"
                />
                <div className="smaller">
                  Writes out (some of) the raw JSON received from the Tablo to
                  files.
                </div>
              </Col>
            </Row>
          </div>
          <div>
            <Row>
              <Col>
                <Directory
                  label="Export Path"
                  onClick={() => this.setPathDialog('exportDataPath')}
                  onChange={this.setExportDataPath}
                  value={exportDataPath}
                  disabled={!enableExportData}
                />
              </Col>
            </Row>
          </div>

          <Row className="p-1 mb-2 mt-4">
            <Col md="8" className="pt-1 border bg-warning">
              <h6 className="pt-1 text-white">DEBUG:</h6>
            </Col>
          </Row>
          <Row className="mt-3">
            <div className="p-2 pl-4 bg-light border col-md-6">
              Your settings <span className="smaller">(all of this)</span> are
              in: <br />
              <span className="ml-1 text-danger">{CONFIG_FILE_NAME}</span>
              <br />
              <i className="smaller">
                You can back that up if you want to nuke the app directory but
                retain settings. <br />
                You probably should not edit it.
              </i>
            </div>
          </Row>

          <Row className="mt-3">
            <Col>
              <Checkbox
                handleChange={this.toggleEnableDebug}
                label="Enable Debug logging"
                checked={enableDebug ? CHECKBOX_ON : CHECKBOX_OFF}
              />
              <div className="pl-4 smaller">
                This doesn&apos;t clean itself up, so turn it off when you
                don&apos;t need it and delete the logs files if you want.
                <br />
              </div>
              <div className="p-2 pl-4 bg-light border col-md-6">
                All Logs are in: <br />
                <span className="ml-1 text-danger">{logsPath}</span>
                <Button
                  className="p-0 pl-1"
                  variant="link"
                  onClick={() => openLogs()}
                  title="Open logs directory"
                >
                  <span className="pl-2 font-weight-bolder fa fa-external-link-alt text-primary" />
                </Button>
                <br />
                <i className="smaller">
                  main.log and renderer.log are general internal logs
                </i>
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <ExportData />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

/**
 * @return {string}
 */
// function SaveStatus(prop) {
//   const { state, invalid } = prop;

//   if (state === SAVE_NONE) return '';

//   if (state === SAVE_SUCCESS) {
//     return <Alert variant="success">Settings Saved!</Alert>;
//   }

//   return (
//     <Alert variant="danger">
//       Errors occurred saving Settings!
//       {invalid.map(item => (
//         <li>{item}</li>
//       ))}
//     </Alert>
//   );
// }

function Directory(prop) {
  const { label, value, onClick, onChange, disabled } = prop;

  return (
    <div className="d-flex flex-row">
      <div>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text title={label} style={{ width: '110px' }}>
              {label}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            value={value}
            placeholder={`Enter ${label}`}
            style={{ width: '350px' }}
            onChange={onChange}
            disabled={disabled}
          />
          <InputGroup.Append>
            <Button
              size="xs"
              variant="outline-secondary"
              onClick={onClick}
              disabled={disabled}
            >
              <span className="fa fa-folder-open" />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(null, mapDispatchToProps)(Settings);
