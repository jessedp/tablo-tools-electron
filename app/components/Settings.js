// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import InputGroup from 'react-bootstrap/InputGroup';
import { isValidIp } from '../utils/utils';
import { updateApi } from '../utils/Tablo';
import getConfig, { ConfigType } from '../utils/config';
import ExportData from './ExportData';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';

const SAVE_NONE = 0;
const SAVE_FAIL = 1;
const SAVE_SUCCESS = 2;

type Props = {};

const { dialog } = require('electron').remote;

export default class Settings extends Component<Props, ConfigType> {
  props: Props;

  constructor() {
    super();

    const storedState = getConfig();

    storedState.saveState = SAVE_NONE;

    this.state = storedState;

    this.setEpisodePath = this.setEpisodePath.bind(this);
    this.setMoviePath = this.setMoviePath.bind(this);
    this.setEventPath = this.setEventPath.bind(this);
    this.setPathDialog = this.setPathDialog.bind(this);

    this.toggleIpOverride = this.toggleIpOverride.bind(this);
    this.toggleAutoRebuild = this.toggleAutoRebuild.bind(this);
    this.setOverrideIp = this.setOverrideIp.bind(this);

    this.toggleDataExport = this.toggleDataExport.bind(this);
    this.setExportDataPath = this.setExportDataPath.bind(this);

    this.saveConfig = this.saveConfig.bind(this);
  }

  setPathDialog = (field: string) => {
    const file = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    if (file) {
      const fields = {};
      // eslint-disable-next-line prefer-destructuring
      fields[field] = file[0];
      this.setState(fields);
    }
  };

  saveConfig = () => {
    const cleanState = { ...this.state };
    cleanState.saveData = [];
    const invalid = [];
    let result = SAVE_FAIL;
    if (cleanState.enableIpOverride) {
      if (!isValidIp(cleanState.overrideIp)) {
        invalid.push(`Invalid IP Address: ${cleanState.overrideIp}`);
      }
    }

    // TODO:  try to validate Export paths?
    if (invalid.length === 0) {
      localStorage.setItem('AppConfig', JSON.stringify(cleanState));
      updateApi();
      result = SAVE_SUCCESS;
      setTimeout(() => {
        this.setState({ saveState: SAVE_NONE });
      }, 3000);
    }

    this.setState({ saveState: result, saveData: [] });
  };

  toggleIpOverride = () => {
    const { enableIpOverride } = this.state;
    this.setState({ enableIpOverride: !enableIpOverride });
  };

  toggleAutoRebuild = () => {
    const { autoRebuild } = this.state;
    this.setState({ autoRebuild: !autoRebuild });
  };

  setOverrideIp = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ overrideIp: event.currentTarget.value });
  };

  toggleDataExport = () => {
    const { enableExportData } = this.state;
    this.setState({ enableExportData: !enableExportData });
  };

  setExportDataPath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ exportDataPath: event.currentTarget.value });
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

  render() {
    const {
      saveData,
      saveState,
      enableIpOverride,
      autoRebuild,
      overrideIp,
      enableExportData,
      exportDataPath,
      episodePath,
      moviePath,
      eventPath
    } = this.state;

    return (
      <Container>
        <Alert variant="primary" className="p-2 m-2">
          <Row>
            <Col md="2" className="pt-2">
              <h4 className="pl-2">Settings</h4>
            </Col>
            <Col>
              <Button
                size="sm"
                className="mt-1 ml-5"
                variant="outline-light"
                type="button"
                onClick={this.saveConfig}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Alert>
        <Row>
          <Col>
            <SaveStatus invalid={saveData} state={saveState} />
          </Col>
        </Row>

        <Row className="mt-3" style={{ width: '375px' }}>
          <Col>
            <Checkbox
              handleChange={this.toggleAutoRebuild}
              checked={autoRebuild ? CHECKBOX_ON : CHECKBOX_OFF}
              label="Enable automatically rebuilding local database?"
            />
          </Col>
        </Row>

        <Row className="p-1 mb-2">
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
                checked={enableIpOverride ? CHECKBOX_ON : CHECKBOX_OFF}
                label="Override Tablo IP?"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col>
              <Form.Control
                value={overrideIp}
                type="text"
                placeholder="Enter IP"
                onChange={this.setOverrideIp}
                disabled={!enableIpOverride}
              />
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
                Writes out the raw JSON received from the Tablo to files.
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

        <Row className="p-1 mb-2 mt-5">
          <Col md="7" className="pt-1 border bg-warning">
            <h6 className="pt-1 text-white">DEBUG:</h6>
          </Col>
        </Row>

        <Row>
          <Col>
            <ExportData />
          </Col>
        </Row>
      </Container>
    );
  }
}

/**
 * @return {string}
 */
function SaveStatus(prop) {
  const { state, invalid } = prop;

  if (state === SAVE_NONE) return '';

  if (state === SAVE_SUCCESS) {
    return <Alert variant="success">Settings Saved!</Alert>;
  }

  return (
    <Alert variant="danger">
      Errors occurred saving Settings!
      {invalid.map(item => (
        <li>{item}</li>
      ))}
    </Alert>
  );
}

function Directory(prop) {
  const { label, value, onClick, onChange, disabled } = prop;

  return (
    <div className="d-flex flex-row">
      <div>
        <InputGroup className="">
          <InputGroup.Prepend>
            <Form.Label
              className="pt-2 bg-light pb-1 pr-1 pl-1 border"
              style={{ width: '110px' }}
            >
              {label}
            </Form.Label>
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
              style={{ height: '35px' }}
              size="xs"
              variant="outline-secondary"
              onClick={onClick}
              disabled={disabled}
            >
              Pick
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}
