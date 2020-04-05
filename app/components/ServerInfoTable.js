// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';

type Props = { device: Object };

export default class ServerInfoTable extends Component<Props> {
  props: Props;

  render() {
    const { device } = this.props;

    if (!device || Object.keys(device).length === 0) {
      return '';
    }

    if (!device.name) {
      console.log(device);
      return <Alert variant="warning">Unable to contact Tablo</Alert>;
    }

    return (
      <Table striped bordered size="sm" variant="">
        <tbody>
          <tr>
            <th>Tablo name</th>
            <td>{device.name} </td>
          </tr>
          <tr>
            <th>Server ID</th>
            <td>{device.server_id}</td>
          </tr>
          <tr>
            <th>Local IP</th>
            <td>{device.local_address}</td>
          </tr>
          <tr>
            <th>Timezone</th>
            <td>{device.timezone}</td>
          </tr>
          <tr>
            <th>Firmware version</th>
            <td>{device.version}</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}
