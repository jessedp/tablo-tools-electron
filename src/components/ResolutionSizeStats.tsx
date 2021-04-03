// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import MediumPie from './MediumPie';
import { readableBytes } from '../utils/utils';

type Props = {};

type State = {
  recTotal: number,
  resData: Array<{}>
};

export default class ResolutionSizeStats extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      resData: []
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
    const res = {};
    recs.forEach(rec => {
      const currentRes = rec.airing_details.channel.channel.resolution;
      const { size } = rec.video_details;
      res[currentRes] = res[currentRes] ? res[currentRes] + size : size;
    });
    const resMap = { hd_1080: 'HD 1080', hd_720: 'HD 720', sd: 'SD' };

    const resData = [];
    Object.keys(res).forEach(key => {
      resData.push({
        id: resMap[key],
        label: readableBytes(res[key]),
        value: res[key]
      });
    });

    this.setState({
      recTotal,
      resData
    });
  }

  render() {
    const { recTotal, resData } = this.state;

    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );

    return (
      <div>
        <MediumPie
          data={resData}
          scheme="accent"
          totalFormat={val => {
            return readableBytes(val);
          }}
        />
      </div>
    );
  }
}
