import { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as FlashActions from '../store/flash';
import * as ConfigActions from '../store/config';
import type { FlashRecordType } from '../constants/types';
import { isValidIp } from '../utils/utils';
import { discover } from '../utils/Tablo';
// these next 2 are gross and from not cleaning up the main/render split
import getConfig, {
  getPath,
  setConfigItem as setConfigItemFs,
} from '../utils/config';
import { ConfigType } from '../constants/types_config';

import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
// import DurationPicker from './DurationPicker';
import Directory from './Directory';

type OwnProps = Record<string, never>;
type StateProps = Record<string, never>;

type DispatchProps = {
  sendFlash: (message: FlashRecordType) => void;
  setConfigItem: (item: Record<string, any>) => void;
};

type SettingsGeneralProps = OwnProps & StateProps & DispatchProps;

export const getPathSaveMessage = (field: string, pathName: string) => {
  let type = '';
  switch (field) {
    case 'exportDataPath':
      type = 'Export Data';
      break;

    case 'episodePath':
      type = 'Episode';
      break;

    case 'moviePath':
      type = 'Movie';
      break;

    case 'eventPath':
      type = 'Sports';
      break;

    case 'programPath':
    default:
      type = 'Manual Program';
  }
  const message = `${type} exports will appear in ${pathName}`;
  return message;
};

class SettingsGeneral extends Component<SettingsGeneralProps, ConfigType> {
  constructor(props: SettingsGeneralProps) {
    super(props);
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
  }

  savePath = (field: string, pathName: string) => {
    const message = getPathSaveMessage(field, pathName);
    const item: Record<string, any> = {};
    // eslint-disable-next-line prefer-destructuring
    item[field] = pathName;
    this.saveConfigItem(item, {
      message,
    });
  };

  setPathDialog = (field: string) => {
    const file = window.ipcRenderer.sendSync('open-dialog', {
      defaultPath: field,
      properties: ['openDirectory'],
    });
    if (!file) return;

    this.savePath(field, file[0]);
  };

  /** This does the real work... */
  saveConfigItem = (item: any, message: FlashRecordType) => {
    const { sendFlash, setConfigItem } = this.props;

    this.setState(item);
    setConfigItemFs(item);
    setConfigItem(item);
    if (!message) sendFlash(message);
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
    const { autoRebuild } = this.state;
    if (!minutes) return;
    let message = '';
    if (autoRebuild)
      message = `DB Rebuild will happen every ${minutes} minutes`;

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
    // !autoUpdate because we haven't saved the option, but want a correct message
    let message = 'Automatic Updates are now disabled';
    if (!autoUpdate) {
      message =
        'Automatic Updates are now enabled. Re-open the app for updates.';
    }
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
    // and immediately check just in case
    window.ipcRenderer.send('set-autoupdate-check');
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

  toggleErrorReport = () => {
    const { allowErrorReport } = this.state;
    // this.setState();
    const message = `Error Reporting is now ${
      !allowErrorReport ? 'enabled' : 'disabled'
    }`;
    const type = !allowErrorReport ? 'success' : 'warning';

    // SentryToggle(!allowErrorReport);

    this.saveConfigItem(
      {
        allowErrorReport: !allowErrorReport,
      },
      {
        message,
        type,
      }
    );
  };

  setPath = (
    field: string,
    event: React.SyntheticEvent<HTMLInputElement> | string,
    save = false
  ) => {
    let newVal = '';
    if (typeof event === 'string') {
      newVal = event;
    } else {
      newVal = event.currentTarget.value;
    }

    if (save) {
      this.savePath(field, newVal);
    } else {
      const item: any = {};
      item[field] = newVal;
      this.setState(item);
    }
  };

  setEpisodePath = (
    event: React.SyntheticEvent<HTMLInputElement> | string,
    save = false
  ) => {
    this.setPath('episodePath', event, save);
  };

  setMoviePath = (
    event: React.SyntheticEvent<HTMLInputElement> | string,
    save = false
  ) => {
    this.setPath('moviePath', event, save);
  };

  setEventPath = (
    event: React.SyntheticEvent<HTMLInputElement> | string,
    save = false
  ) => {
    this.setPath('eventPath', event, save);
  };

  setProgramPath = (
    event: React.SyntheticEvent<HTMLInputElement> | string,
    save = false
  ) => {
    this.setPath('programPath', event, save);
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

  setTestDeviceIp = (event: React.SyntheticEvent<HTMLInputElement>) => {
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

  render() {
    const {
      autoRebuild,
      // autoRebuildMinutes,
      autoUpdate,
      notifyBeta,
      allowErrorReport,
      episodePath,
      moviePath,
      eventPath,
      programPath,
    } = this.state;
    let logsPath = getPath('logs');
    const appName = window.ipcRenderer.sendSync('get-name');
    const test = new RegExp(`${appName}`, 'g');
    const mat = logsPath.match(test);

    if (mat && mat.length > 1) {
      for (let i = 1; i < mat.length; i += 1)
        logsPath = logsPath.replace(`${appName}${window.path.sep()}`, '');
    }

    return (
      <div className="pl-1">
        <div className="mt-3">
          <div>
            <Checkbox
              handleChange={this.toggleAutoRebuild}
              checked={autoRebuild ? CHECKBOX_ON : CHECKBOX_OFF}
              label="Enable automatically rebuilding local database?"
            />
            <div className="pl-4 smaller">
              When enabled, the local recording database will automatically
              reload:
              <ul>
                <li>On startup if outdated</li>
                <li>2 and 32 minutes after the hour.</li>
              </ul>
            </div>
            {/* <DurationPicker
              value={autoRebuildMinutes}
              updateValue={this.setAutoRebuildMinutes}
              disabled={!autoRebuild}
            /> */}
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
              Try to automatically download and install <b>new releases</b>.
              Regardless of this setting, a notification will appear when a new
              release is available (or based on your choice below).
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
              No personal data is collected - this simply notifies us of errors
              before you may post about it or even notice a problem. It does the{' '}
              <i>white screen of death</i> information gathering for you (and
              more).
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
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ ...FlashActions, ...ConfigActions }, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(SettingsGeneral);
