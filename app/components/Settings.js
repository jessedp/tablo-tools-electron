// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { isValidIp } from '../utils/utils';
import { updateApi } from '../utils/Tablo';
import getConfig, { ConfigType } from '../utils/config';

const SAVE_NONE = 0;
const SAVE_FAIL = 1;
const SAVE_SUCCESS = 2;

type Props = {};

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

    this.toggleIpOverride = this.toggleIpOverride.bind(this);
    this.toggleAutoRebuild = this.toggleAutoRebuild.bind(this);
    this.setOverrideIp = this.setOverrideIp.bind(this);

    this.toggleDataExport = this.toggleDataExport.bind(this);
    this.setExportDataPath = this.setExportDataPath.bind(this);

    this.saveConfig = this.saveConfig.bind(this);
  }

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

  toggleIpOverride = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ enableIpOverride: event.currentTarget.checked });
  };

  toggleAutoRebuild = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ autoRebuild: event.currentTarget.checked });
  };

  setOverrideIp = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ overrideIp: event.currentTarget.value });
  };

  toggleDataExport = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ enableExportData: event.currentTarget.checked });
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
        <Row style={{ width: '100%' }}>
          <Col>
            <Alert variant="primary"> Settings</Alert>
          </Col>
        </Row>
        <Row>
          <Col>
            <SaveStatus invalid={saveData} state={saveState} />
          </Col>
        </Row>
        <Row>
          <Form style={{ width: '100%' }} onSubmit={e => e.preventDefault()}>
            <Form.Row>
              <Form.Group controlId="episodePath" style={{ width: '35%' }}>
                <Form.Label>Series/Episode Path</Form.Label>
                <Form.Control
                  value={episodePath}
                  type="text"
                  placeholder="Enter Episode Path"
                  onChange={this.setEpisodePath}
                />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group controlId="moviePath" style={{ width: '35%' }}>
                <Form.Label>Movie Path</Form.Label>
                <Form.Control
                  value={moviePath}
                  type="text"
                  placeholder="Enter Movie Path"
                  onChange={this.setMoviePath}
                />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group controlId="eventPath" style={{ width: '35%' }}>
                <Form.Label>Sport/Event Path</Form.Label>
                <Form.Control
                  value={eventPath}
                  type="text"
                  placeholder="Enter Event Path"
                  onChange={this.setEventPath}
                />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group controlId="autoRebuild">
                <Form.Check
                  checked={autoRebuild}
                  className="pr-2"
                  onChange={this.toggleAutoRebuild}
                  type="checkbox"
                  label="Enable automatically rebuilding local database?"
                />
              </Form.Group>
            </Form.Row>

            <Alert variant="warning">Advanced</Alert>

            <Form.Row>
              <Form.Group controlId="overrideIp">
                <Form.Check
                  checked={enableIpOverride}
                  className="pr-2"
                  onChange={this.toggleIpOverride}
                  type="checkbox"
                  label="Override Tablo IP?"
                />
                <Form.Control
                  value={overrideIp}
                  type="text"
                  placeholder="Enter IP"
                  onChange={this.setOverrideIp}
                  disabled={!enableIpOverride}
                />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group controlId="exportData">
                <Form.Check
                  checked={enableExportData}
                  onChange={this.toggleDataExport}
                  type="checkbox"
                  label="Export Tablo Data?"
                />
                <span className="smaller">
                  Writes out the raw JSON received from the Tablo to files.
                </span>
                <Form.Control
                  value={exportDataPath}
                  type="text"
                  placeholder="Enter Path"
                  onChange={this.setExportDataPath}
                  disabled={!enableExportData}
                />
              </Form.Group>
            </Form.Row>
          </Form>
        </Row>
        <Row>
          <Button variant="primary" type="button" onClick={this.saveConfig}>
            Save
          </Button>
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
