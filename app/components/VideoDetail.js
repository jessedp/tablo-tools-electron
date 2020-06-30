// @flow
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';

import { boolStr, readableBytes, readableDuration } from '../utils/utils';

/** TODO: make VideoDetails type */
type Props = { details: Object };

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

/**
 * @return {string}
 */
function Error(prop) {
  const { error } = prop.detail;
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

/**
 * @return {string}
 */
function CommercialSkip(prop) {
  const { comskip } = prop.detail;
  if (!comskip) return '';
  return (
    <h6>
      Commercial Skip status: <b>{comskip.state}</b>{' '}
      {comskip.error ? `(${comskip.error})` : ''}
    </h6>
  );
}
