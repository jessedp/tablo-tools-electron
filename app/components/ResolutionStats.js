// @flow
import React, { Component, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import MediumBar from './MediumBar';

type Props = {};

type State = {
  recTotal: number,
  resolutionData: Array<Object>,
  resolutionKeys: Array<string>
};

export default class ResolutionStats extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      resolutionData: [],
      resolutionKeys: []
    };
    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    const { RecDb } = global;
    const recTotal = await RecDb.asyncCount({});

    /** resolution * */
    const recs = await RecDb.asyncFind({});
    const resCounts = {};

    recs.forEach(rec => {
      const { channel } = rec.airing_details.channel;
      const { resolution } = channel;
      const title = `${channel.network} (${channel.call_sign})`;
      if (!resCounts[resolution]) resCounts[resolution] = {};
      resCounts[resolution][title] = resCounts[resolution][title]
        ? resCounts[resolution][title] + 1
        : 1;
    });

    const resolutionData = [];
    const resolutionKeys = [];
    const resMap = {
      hd_1080: 'HD 1080',
      hd_720: 'HD 720',
      sd: 'SD'
    };
    Object.keys(resCounts).forEach(key => {
      const resolution = {};
      Object.keys(resCounts[key]).forEach(title => {
        resolution[title] = resCounts[key][title];
        resolutionKeys.push(title);
      });
      resolution.resolution = resMap[key] ? resMap[key] : '??';
      resolutionData.push(resolution);
    });

    resolutionData.sort((a, b) => (a.resolution > b.resolution ? 1 : -1));

    this.setState({
      recTotal,
      resolutionData,
      resolutionKeys: [...new Set(resolutionKeys)]
    });
  }

  render() {
    const { recTotal, resolutionData, resolutionKeys } = this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );

    return (
      <Col>
        <MediumBar
          data={resolutionData}
          indexBy="resolution"
          keys={resolutionKeys}
          scheme="set3"
        />
        <ResolutionTable resolutionData={resolutionData} />
      </Col>
    );
  }
}

function ResolutionTable(prop) {
  const [show, setShow] = useState(false);

  const toggle = () => setShow(!show);

  const { resolutionData } = prop;
  if (!show) {
    return (
      <Button variant="outline-dark" size="xs" onClick={toggle}>
        <span className="fa fa-chevron-circle-right pr-1" />
        show data
      </Button>
    );
  }

  return (
    <>
      <Button variant="light" onClick={toggle} size="xs">
        <span className="fa fa-chevron-circle-up pr-1" />
        hide
      </Button>
      {resolutionData.map(res => {
        const head = res.resolution;
        const rows = Object.keys(res).map(key => {
          if (key !== 'resolution') {
            return (
              <tr key={`tr-${key}-${res[key]}`}>
                <td>{key}</td>
                <td>{res[key]}</td>
              </tr>
            );
          }
          return <></>;
        });
        return (
          <Table
            size="sm"
            striped
            key={`resolution-stats-table-${res.resolution}`}
          >
            <tbody>
              <tr key={`resolution-stats-row-${res.resolution}`}>
                <th colSpan="2">{head}</th>
              </tr>
              {rows}
            </tbody>
          </Table>
        );
      })}
    </>
  );
}
