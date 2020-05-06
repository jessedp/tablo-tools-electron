// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import Col from 'react-bootstrap/Col';
import MediumBar from './MediumBar';

type Props = {};

type State = {
  recTotal: number,
  selResolution: string,
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
      selResolution: '',
      resolutionData: [],
      resolutionKeys: []
    };

    (this: any).refresh = this.refresh.bind(this);
    (this: any).chartClick = this.chartClick.bind(this);
    (this: any).clearResolution = this.clearResolution.bind(this);
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
    const { selResolution } = this.state;
    const recTotal = await RecDb.asyncCount({});

    /** resolution * */
    const recs = await RecDb.asyncFind({});
    const resCounts = {};
    const resMap = {
      hd_1080: 'HD 1080',
      hd_720: 'HD 720',
      sd: 'SD'
    };

    const counter = [];
    recs.forEach(rec => {
      const { channel } = rec.airing_details.channel;
      const { resolution } = channel;

      const title = channel.network;

      if (selResolution === resMap[resolution]) {
        console.log(
          'selResolution === resolution',
          selResolution,
          resMap[resolution]
        );
        resCounts[title] = resCounts[title] ? resCounts[title] + 1 : 1;
        console.log(resCounts[title]);
      } else if (!selResolution) {
        const key = `${title}`;
        if (!counter.includes(key)) {
          counter.push(key);
          resCounts[resolution] = resCounts[resolution]
            ? resCounts[resolution] + 1
            : 1;
        }
      }
    });

    const resolutionData = [];
    const resolutionKeys = [];
    Object.keys(resCounts).forEach(key => {
      if (!selResolution) {
        resolutionData.push({
          resolution: resMap[key],
          resolutions: resCounts[key]
        });
        resolutionKeys.push('resolutions');
      } else {
        resolutionData.push({ resolution: key, channels: resCounts[key] });
        resolutionKeys.push('channels');
      }
    });

    resolutionData.sort((a, b) => (a.resolution > b.resolution ? 1 : -1));

    this.setState({
      recTotal,
      resolutionData,
      resolutionKeys: [...new Set(resolutionKeys)]
    });
  }

  chartClick = async (data: Object) => {
    if (data.indexValue) {
      await this.setState({ selResolution: data.indexValue });
      this.refresh();
    }
  };

  clearResolution = async () => {
    await this.setState({ selResolution: '' });
    this.refresh();
  };

  render() {
    const {
      recTotal,
      selResolution,
      resolutionData,
      resolutionKeys
    } = this.state;
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
          scheme="pastel2"
          onClick={!selResolution ? this.chartClick : () => {}}
          back={selResolution ? this.clearResolution : null}
        />
      </Col>
    );
  }
}
