import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import { readableDuration } from '../utils/utils';
import MediumBar from './MediumBar';

type Props = Record<string, never>;
type State = {
  recTotal: number;
  durData: Array<Record<string, any>>;
};
export default class RecordingDurationStats extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      durData: [],
    };
    this.psToken = '';
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    // const { RecDb } = global;
    const recTotal = await window.db.countAsync('RecDb', {});
    const recs = await window.db.findAsync('RecDb', {});
    const durs: Record<string, any> = {};
    const durReal: Record<string, any> = {};
    recs.forEach((rec: Record<string, any>) => {
      const dur = rec.airing_details.duration;
      const currentDur = readableDuration(Math.round(dur / 300) * 300);
      durs[currentDur] = durs[currentDur] ? durs[currentDur] + 1 : 1;
      durReal[currentDur] = dur;
    });
    const durKeys = Object.keys(durReal).sort((a, b) =>
      durReal[a] > durReal[b] ? 1 : -1
    );
    const durData: Array<Record<string, any>> = [];

    durKeys.forEach((key) => {
      durData.push({
        id: key,
        label: readableDuration(durs[key]),
        value: durs[key],
      });
    });
    this.setState({
      recTotal,
      durData,
    });
  }

  render() {
    const { recTotal, durData } = this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    return (
      <div>
        <MediumBar data={durData} keys={['value']} indexBy="id" scheme="nivo" />
      </div>
    );
  }
}
