import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as FlashActions from '../store/flash';
import type { FlashRecordType } from '../constants/types';
import { isValidIp } from '../utils/utils';
import { discover } from '../utils/Tablo';
import getConfig, {
  getPath,
  ConfigType,
  setConfigItem,
  CONFIG_FILE_NAME,
} from '../utils/config';
import ExportData from './ExportData';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import Directory from './Directory';
import OpenDirectory from './OpenDirecory';

type OwnProps = Record<string, never>;
type StateProps = Record<string, never>;

type DispatchProps = {
  sendFlash: (message: FlashRecordType) => void;
};

type SettingsAdvancedProps = OwnProps & StateProps & DispatchProps;

class SettingsAdvanced extends Component<SettingsAdvancedProps, ConfigType> {
  constructor(props: SettingsAdvancedProps) {
    super(props);
    const storedState = getConfig();
    this.state = storedState;
    this.setPathDialog = this.setPathDialog.bind(this);
    this.toggleIpOverride = this.toggleIpOverride.bind(this);
    this.toggleAutoRebuild = this.toggleAutoRebuild.bind(this);
    this.toggleAutoUpdate = this.toggleAutoUpdate.bind(this);
    this.setAutoRebuildMinutes = this.setAutoRebuildMinutes.bind(this);
    this.toggleNotifyBeta = this.toggleNotifyBeta.bind(this);
    this.setTestDeviceIp = this.setTestDeviceIp.bind(this);
    this.saveTestDeviceIp = this.saveTestDeviceIp.bind(this);
    this.toggleEnableDebug = this.toggleEnableDebug.bind(this);
    this.toggleDataExport = this.toggleDataExport.bind(this);
    this.setExportDataPath = this.setExportDataPath.bind(this);
  }

  setPathDialog = (field: string) => {
    const file = window.ipcRenderer.sendSync('open-dialog', {
      defaultPath: field,
      properties: ['openDirectory'],
    });

    if (file) {
      const fields: Record<string, any> = {};
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
      const item: Record<string, any> = {};
      // eslint-disable-next-line prefer-destructuring
      item[field] = file[0];
      this.saveConfigItem(item, {
        message,
      });
    }
  };

  /** This does the real work... */
  saveConfigItem = (item: any, message: FlashRecordType) => {
    const { sendFlash } = this.props;
    this.setState(item);
    setConfigItem(item);
    sendFlash(message);
  };

  toggleAutoRebuild = () => {
    const { autoRebuild } = this.state;
    const message = `Auto-rebuild ${!autoRebuild ? 'enabled' : 'disabled'}`;
    const type = !autoRebuild ? 'success' : 'warning';
    this.saveConfigItem(
      {
        autoRebuild: !autoRebuild,
      },
      {
        message,
        type,
      }
    );
  };

  setAutoRebuildMinutes = (minutes: number | null) => {
    if (!minutes) return;
    const message = `DB Rebuild will happen every ${minutes} minutes`;
    this.saveConfigItem(
      {
        autoRebuildMinutes: minutes,
      },
      {
        message,
      }
    );
  };

  toggleAutoUpdate = () => {
    const { autoUpdate } = this.state;
    const message = `Automatic Updates are now ${
      !autoUpdate ? 'enabled' : 'disabled'
    }`;
    const type = !autoUpdate ? 'success' : 'warning';
    this.saveConfigItem(
      {
        autoUpdate: !autoUpdate,
      },
      {
        message,
        type,
      }
    );
  };

  toggleNotifyBeta = () => {
    const { notifyBeta } = this.state;
    const message = `Pre-release Notifications will  ${
      !notifyBeta ? '' : 'no longer'
    } be shown`;
    const type = !notifyBeta ? 'success' : 'warning';
    this.saveConfigItem(
      {
        notifyBeta: !notifyBeta,
      },
      {
        message,
        type,
      }
    );
  };

  toggleIpOverride = () => {
    const { enableTestDevice } = this.state;
    const message = `Test Device ${!enableTestDevice ? 'enabled' : 'disabled'}`;
    const type = !enableTestDevice ? 'success' : 'warning';
    this.saveConfigItem(
      {
        enableTestDevice: !enableTestDevice,
      },
      {
        message,
        type,
      }
    );
  };

  saveTestDeviceIp = () => {
    const { sendFlash } = this.props;
    const { testDeviceIp } = this.state;

    if (!isValidIp(testDeviceIp)) {
      sendFlash({
        type: 'danger',
        message: `Invalid IP Address: ${testDeviceIp}`,
      });
      return;
    }

    const message = `${testDeviceIp} set as Test Device!`;
    this.saveConfigItem(
      {
        testDeviceIp,
      },
      {
        message,
      }
    );
    discover();
  };

  setTestDeviceIp = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      testDeviceIp: event.currentTarget.value,
    });
  };

  toggleDataExport = () => {
    const { enableExportData } = this.state;
    const message = `Data Export ${!enableExportData ? 'enabled' : 'disabled'}`;
    const type = !enableExportData ? 'success' : 'warning';
    this.saveConfigItem(
      {
        enableExportData: !enableExportData,
      },
      {
        message,
        type,
      }
    );
  };

  toggleEnableDebug = () => {
    const { enableDebug } = this.state;
    const message = `Debug logging ${!enableDebug ? 'enabled' : 'disabled'}`;
    const type = !enableDebug ? 'success' : 'warning';
    this.saveConfigItem(
      {
        enableDebug: !enableDebug,
      },
      {
        message,
        type,
      }
    );
  };

  setExportDataPath = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      exportDataPath: event.currentTarget.value,
    });
  };

  render() {
    const {
      enableTestDevice,
      testDeviceIp,
      enableExportData,
      exportDataPath,
      enableDebug,
    } = this.state;
    let logsPath = getPath('logs');
    const appName = window.ipcRenderer.sendSync('get-name');
    const test = new RegExp(`${appName}`, 'g');
    const mat = logsPath.match(test);

    if (mat && mat.length > 1) {
      for (let i = 1; i < mat.length; i += 1)
        logsPath = logsPath.replace(`${appName}${window.path.sep}`, '');
    }

    // const openLogs = () => {
    //   console.log(window.path.normalize(`${logsPath}/main.log`));
    //   shell.showItemInFolder(window.path.normalize(`${logsPath}/main.log`));
    // };
    return (
      <div className="d-flex flex-row">
        <div>
          <div
            style={{
              width: '375px',
            }}
          >
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
            <div className="p-2 pl-4 bg-light border col-md-10">
              Your settings <span className="smaller">(all of this)</span> are
              in: <br />
              <span className="ml-1 text-danger mr-2">{CONFIG_FILE_NAME}</span>
              <OpenDirectory path={CONFIG_FILE_NAME} />
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
              <div className="p-2 pl-4 bg-light border col-md-10">
                All Logs are in: <br />
                <span className="ml-1 text-danger mr-2">
                  {`${logsPath}${window.path.sep}`}
                </span>
                <OpenDirectory path={`${logsPath}${window.path.sep}`} />
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

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(SettingsAdvanced);
