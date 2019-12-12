// @flow
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';

import { boolStr, readableBytes, readableDuration } from '../utils/utils';

type Props = { details: null };

export default class VideoDetail extends Component<Props> {
  props: Props;

  render() {
    const { details } = this.props;
    return (
      <Table size="sm">
        <tbody>
          <tr>
            <th>Audio</th>
            <td>{details.audio}</td>
            <th>Clean?</th>
            <td>{boolStr(details.clean)}</td>
            <th>Cloud?</th>
            <td>{boolStr(details.cloud)}</td>
          </tr>
          <tr>
            <th>Size</th>
            <td>
              {readableBytes(details.size)} &nbsp; (
              {readableDuration(details.duration)})
            </td>
          </tr>
          <tr>
            <th>Dimensions</th>
            <td>
              {details.width}x{details.height}
            </td>
            <th>uploading?</th>
            <td>{boolStr(details.uploading)}</td>
          </tr>
          <tr>
            <td colSpan="6">
              <CommercialSkip detail={details} />
              <Error detail={details} />
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

function Error(prop) {
  const { error } = prop.detail;
  console.log('Video Error', error);
  if (!error) return '';
  return (
    <Alert variant="warning">
      <h6>
        {' '}
        Error: {error.code} - {error.details}
      </h6>
    </Alert>
  );
}

function CommercialSkip(prop) {
  const { comskip } = prop.detail;
  console.log(comskip);
  if (!comskip) return '';
  return (
    <h6>
      Commerical Skip status: <b>{comskip.state}</b>{' '}
      {comskip.error ? `(${comskip.error})` : ''}
    </h6>
  );
}
