// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import { readableDuration } from '../utils/utils';
import MediumBar from './MediumBar';

type Props = {};

type State = {
  recTotal: number,
  durData: Array<{}>
};

export default class RecordingDurationStats extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      durData: []
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
    const recs = await RecDb.asyncFind({});

    const durs = {};
    const durReal = {};

    recs.forEach(rec => {
      const dur = rec.airing_details.duration;
      const currentDur = readableDuration(Math.round(dur / 300) * 300);

      durs[currentDur] = durs[currentDur] ? durs[currentDur] + 1 : 1;
      durReal[currentDur] = dur;
    });

    const durKeys = Object.keys(durReal).sort((a, b) =>
      durReal[a] > durReal[b] ? 1 : -1
    );

    const durData = [];
    durKeys.forEach(key => {
      durData.push({
        id: key,
        label: readableDuration(durs[key]),
        value: durs[key]
      });
    });

    this.setState({
      recTotal,
      durData
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
