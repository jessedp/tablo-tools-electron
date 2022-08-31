import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import Col from 'react-bootstrap/Col';
import MediumBar from './MediumBar';
import { ellipse } from '../utils/utils';

type Props = Record<string, never>;
type State = {
  recTotal: number;
  network: string;
  showData: Array<Record<string, any>>;
  showKeys: Array<string>;
};
export default class ChannelShowStats extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      network: '',
      showData: [],
      showKeys: [],
    };
    this.psToken = '';
    (this as any).refresh = this.refresh.bind(this);
    (this as any).chartClick = this.chartClick.bind(this);
    (this as any).clearNetwork = this.clearNetwork.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): any {
    PubSub.unsubscribe(this.psToken);
  }

  chartClick = async (data: Record<string, any>) => {
    if (data.indexValue) {
      await this.setState({
        network: data.indexValue,
      });
      this.refresh();
    }
  };

  clearNetwork = async () => {
    await this.setState({
      network: '',
    });
    this.refresh();
  };

  async refresh() {
    // const { RecDb } = global;
    const { network } = this.state;
    const recTotal = await window.db.asyncCount('RecDb', {});
    const recs = await window.db.asyncFind('RecDb', {});
    const showCounts: Record<string, any> = {};
    const counter: string[] = [];
    recs.forEach((rec: Record<string, any>) => {
      const { channel } = rec.airing_details.channel;

      if (network === channel.network) {
        const title = ellipse(rec.airing_details.show_title, 10);
        showCounts[title] = showCounts[title] ? showCounts[title] + 1 : 1;
      } else if (network === '') {
        const netwrk = `${channel.network}`;
        const key = `${netwrk}-${rec.airing_details.show_title}`;

        if (!counter.includes(key)) {
          counter.push(key);
          showCounts[netwrk] = showCounts[netwrk] ? showCounts[netwrk] + 1 : 1;
        }
      }
    });
    const showData: Array<Record<string, any>> = [];
    const showKeys: string[] = [];
    Object.keys(showCounts).forEach((key) => {
      // let channel = {};
      // Object.keys(showCounts[key]).forEach(title => {
      //   channel[title] = showCounts[key][title];
      //   showKeys.push(title);
      // });
      //
      // channel.channel = key || '??';
      // channel = sortObject(channel);
      if (!network) {
        showData.push({
          channel: key,
          shows: showCounts[key],
        });
        showKeys.push('shows');
      } else {
        showData.push({
          channel: key,
          recordings: showCounts[key],
        });
        showKeys.push('recordings');
      }
    });
    showData.sort((a, b) => {
      return a.channel > b.channel ? -1 : 1;
    });
    this.setState({
      recTotal,
      showData,
      showKeys: [...new Set(showKeys)],
    });
  }

  render() {
    const { recTotal, showData, showKeys, network } = this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    return (
      <Col>
        {network ? (
          <div
            className="stats-header"
            style={{
              textTransform: 'uppercase',
            }}
          >
            {network}
          </div>
        ) : (
          ''
        )}
        <MediumBar
          data={showData}
          indexBy="channel"
          keys={showKeys}
          scheme="set3"
          layout="horizontal"
          onClick={!network ? this.chartClick : () => undefined}
          back={network ? this.clearNetwork : null}
        />
      </Col>
    );
  }
}
