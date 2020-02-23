import React, { Component } from 'react';

import Table from 'react-bootstrap/Table';

import Alert from 'react-bootstrap/Alert';
import { RecDb } from '../utils/db';

type Props = {};

export default class ComskipDetails extends Component<Props> {
  props: Props;

  constructor() {
    super();
    this.state = { skipStats: {}, skipErrors: {}, recCount: 0 };
  }

  async componentDidMount(): void {
    // const comskip = await RecDb.asyncCount({ 'video_details.comskip': { $exists: true } });
    const recs = await RecDb.asyncFind({});
    const skipStats = {};
    const skipErrors = {};

    recs.forEach(rec => {
      const cs = rec.video_details.comskip;
      if (cs.state in skipStats) {
        skipStats[cs.state] += 1;
      } else {
        skipStats[cs.state] = 0;
      }
      if (cs.error) {
        if (cs.error in skipErrors) {
          skipErrors[cs.error] += 1;
        } else {
          skipErrors[cs.error] = 0;
        }
      }
    });

    await this.setState({ recCount: recs.length, skipStats, skipErrors });
  }

  render() {
    const { recCount, skipStats, skipErrors } = this.state;

    if (!recCount)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );

    return (
      <>
        {skipStats ? (
          <Table striped bordered size="sm">
            <tbody>
              <tr>
                <th style={{ width: '75px' }}>Ready:</th>
                <td>{skipStats.ready}</td>
              </tr>
              <tr>
                <th>Unknown:</th>
                <td>{skipStats.none}</td>
              </tr>
              <tr>
                <th>Errors:</th>
                <td>
                  {skipStats.error}
                  {skipErrors ? (
                    <Table striped size="sm">
                      <tbody>
                        <tr>
                          <th colSpan="2">Types of Errors:</th>
                        </tr>
                        <tr>
                          <td style={{ width: '40px' }}>
                            {skipErrors.internal}
                          </td>
                          <th>internal</th>
                        </tr>
                        <tr>
                          <td>{skipErrors.reception}</td>
                          <th>reception</th>
                        </tr>
                        <tr>
                          <td>{skipErrors.network}</td>
                          <th>network</th>
                        </tr>
                        <tr>
                          <td>{skipErrors.unsuitable}</td>
                          <th>unsuitable</th>
                        </tr>
                        <tr>
                          <td>{skipErrors.filtered}</td>
                          <th>filtered</th>
                        </tr>
                      </tbody>
                    </Table>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        ) : (
          ''
        )}
      </>
    );
  }
}
