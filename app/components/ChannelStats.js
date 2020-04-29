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
  showData: Array<Object>,
  showKeys: Array<string>
};

export default class ChannelStats extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      showData: [],
      showKeys: []
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

    /** channel/show * */
    const recs = await RecDb.asyncFind({});
    const showCounts = {};

    recs.forEach(rec => {
      const { channel } = rec.airing_details.channel;

      const network = `${channel.network}`;
      const title = rec.airing_details.show_title;
      if (!showCounts[network]) showCounts[network] = {};
      showCounts[network][title] = showCounts[network][title]
        ? showCounts[network][title] + 1
        : 1;
    });

    const showData = [];
    const showKeys = [];

    Object.keys(showCounts).forEach(key => {
      const channel = {};
      Object.keys(showCounts[key]).forEach(title => {
        channel[title] = showCounts[key][title];
        showKeys.push(title);
      });
      channel.channel = key || '??';

      showData.push(channel);
    });

    showData.sort((a, b) => (a.channel > b.channel ? 1 : -1));

    this.setState({
      recTotal,
      showData,
      showKeys: [...new Set(showKeys)]
    });
  }

  render() {
    const { recTotal, showData, showKeys } = this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );

    return (
      <Col>
        <MediumBar
          data={showData}
          indexBy="channel"
          keys={showKeys}
          scheme="set3"
        />
        <ShowTable showData={showData} />
      </Col>
    );
  }
}

function ShowTable(prop) {
  const [show, setShow] = useState(false);

  const toggle = () => setShow(!show);

  const { showData } = prop;
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
      {showData.map(res => {
        const head = res.channel;
        const rows = Object.keys(res).map(key => {
          if (key !== 'channel') {
            return (
              <tr key={`channel-stats-tr-${key}-${res[key]}`}>
                <td>{key}</td>
                <td>{res[key]}</td>
              </tr>
            );
          }
          return <></>;
        });
        return (
          <Table size="sm" striped key={`channel-stats-table-${res.channel}`}>
            <tbody>
              <tr key={`channel-stats-row-${res.channel}`}>
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
