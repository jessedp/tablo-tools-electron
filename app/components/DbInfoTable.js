// @flow
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';

import { RecDb, recDbStats } from '../utils/db';

type Props = {};

type State = {
  recTotal: number,
  watched: number,
  finished: number,
  failed: number,
  recording: number,
  typeEpisode: number,
  typeMovie: number,
  typeEvent: number
};

export default class DbInfoTable extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      watched: 0,
      finished: 0,
      failed: 0,
      recording: 0,
      typeEpisode: 0,
      typeMovie: 0,
      typeEvent: 0
    };
  }

  async componentDidMount() {
    const recTotal = await RecDb.asyncCount({});
    const watched = await RecDb.asyncCount({ 'user_info.watched': true });
    const finished = await RecDb.asyncCount({
      'video_details.state': 'finished'
    });
    const failed = await RecDb.asyncCount({ 'video_details.state': 'failed' });
    const recording = await RecDb.asyncCount({
      'video_details.state': 'recording'
    });

    let recType = new RegExp('episode');
    const typeEpisode = await RecDb.asyncCount({ path: { $regex: recType } });

    recType = new RegExp('movie');
    const typeMovie = await RecDb.asyncCount({ path: { $regex: recType } });

    recType = new RegExp('sports');
    const typeEvent = await RecDb.asyncCount({ path: { $regex: recType } });

    this.setState({
      recTotal,
      watched,
      finished,
      failed,
      recording,
      typeEpisode,
      typeMovie,
      typeEvent
    });
  }

  render() {
    const {
      recTotal,
      watched,
      finished,
      failed,
      recording,
      typeEpisode,
      typeMovie,
      typeEvent
    } = this.state;

    const headStyle = { width: '40%' };

    if (!recDbStats().size)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );

    return (
      <div>
        <Table striped bordered size="sm">
          <tbody>
            <tr>
              <th style={headStyle}>Total Recordings </th>
              <td>{recTotal} </td>
            </tr>
            <tr>
              <th style={headStyle}>Watched</th>
              <td>{watched}</td>
            </tr>
          </tbody>
        </Table>

        <h6>By Current Recording State</h6>

        <Table striped bordered size="sm">
          <tbody>
            <tr>
              <th style={headStyle}>Finished</th>
              <td>{finished}</td>
            </tr>
            <tr>
              <th style={headStyle}>Failed</th>
              <td>{failed}</td>
            </tr>
            <tr>
              <th style={headStyle}>In Progress</th>
              <td>{recording}</td>
            </tr>
          </tbody>
        </Table>

        <h6>By Recording Type</h6>
        <Table striped bordered size="sm">
          <tbody>
            <tr>
              <th style={headStyle}>Episodes/Series</th>
              <td>{typeEpisode}</td>
            </tr>
            <tr>
              <th style={headStyle}>Events/Sports</th>
              <td>{typeEvent}</td>
            </tr>
            <tr>
              <th style={headStyle}>Movies</th>
              <td>{typeMovie}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}
