// @flow
import React, { Component } from 'react';
import * as Sentry from '@sentry/electron';
import Store from 'electron-store';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import getConfig, { setConfigItem } from '../utils/config';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';

type Props = {};
type State = { show: boolean, requests: PermissionRequestsType };

export type PermissionRequestsType = {
  allowErrorReport: boolean
};

export const defaultPermissionRequests: PermissionRequestsType = {
  allowErrorReport: false
};

export default class PermissionRequests extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    const store = new Store();
    const requests = Object.assign(
      defaultPermissionRequests,
      store.get('PermissionRequests')
    );
    let show = false;
    Object.keys(requests).forEach(key => {
      if (requests[key] === false) show = true;
    });

    this.state = { show, requests };

    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).setOption = this.setOption.bind(this);
  }

  async componentDidMount() {
    // this.setState({ show: true, releases: releases.data });
  }

  setOption = (
    evt: SyntheticEvent<HTMLInputElement>,
    optionName: string
  ): void => {
    const { requests } = this.state;
    console.log(optionName, evt);
    if (optionName === 'allowErrorReport') {
      requests[optionName] = !requests[optionName];
      if (Sentry.getCurrentHub().getClient()) {
        Sentry.getCurrentHub()
          .getClient()
          .getOptions().enabled = requests[optionName];
      } else {
        console.error('Unable to set Sentry reporting value');
      }
      setConfigItem(optionName, !requests[optionName]);
      this.setState({ requests });
    }
  };

  handleClose() {
    const { requests } = this.state;
    const store = new Store();
    const markedRequests = {};
    Object.keys(requests).forEach(key => {
      markedRequests[key] = true;
    });
    console.log('closing: ', markedRequests);
    store.set('PermissionRequests', markedRequests);
    this.setState({ show: false });
  }

  render() {
    const { show } = this.state;
    const config = getConfig();

    return (
      <Modal
        size="md"
        show={show}
        onHide={this.handleClose}
        animation={false}
        centered
        scrollable
      >
        <Modal.Body>
          <h5 className="text-danger">
            Here are some <b>Settings</b> you should know about
          </h5>
          <div className="smaller muted mb-3">
            <i>We&apos;ll only ask once...</i>
          </div>
          <Checkbox
            handleChange={evt => this.setOption(evt, 'allowErrorReport')}
            label="Allow sending Error Reports?"
            checked={config.allowErrorReport ? CHECKBOX_ON : CHECKBOX_OFF}
          />
          <div className="pl-4 smaller">
            No personal data is collected - this simply notifies of us errors
            before you may post about it or even notice a problem. It does the{' '}
            <i>white screen of death</i> information gathering for you (and
            more).
          </div>
        </Modal.Body>
        <Modal.Footer className="p-1">
          <Button size="sm" variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
