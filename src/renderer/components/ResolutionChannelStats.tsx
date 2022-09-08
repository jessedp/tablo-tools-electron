import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import Col from 'react-bootstrap/Col';
import MediumBar from './MediumBar';

type Props = Record<string, never>;
type State = {
  recTotal: number;
  selResolution: string;
  resolutionData: Array<Record<string, any>>;
  resolutionKeys: Array<string>;
};
export default class ResolutionChannelStats extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      selResolution: '',
      resolutionData: [],
      resolutionKeys: [],
    };
    this.psToken = '';
    (this as any).refresh = this.refresh.bind(this);
    (this as any).chartClick = this.chartClick.bind(this);
    (this as any).clearResolution = this.clearResolution.bind(this);
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
        selResolution: data.indexValue,
      });
      this.refresh();
    }
  };

  clearResolution = async () => {
    await this.setState({
      selResolution: '',
    });
    this.refresh();
  };

  async refresh() {
    const { selResolution } = this.state;
    const recTotal = await window.db.countAsync('RecDb', {});
    const recs = await window.db.findAsync('RecDb', {});
    const resCounts: Record<string, any> = {};
    const resMap = {
      hd_1080: 'HD 1080',
      hd_720: 'HD 720',
      sd: 'SD',
    };
    const counter: string[] = [];
    recs.forEach((rec: Record<string, any>) => {
      const { channel } = rec.airing_details.channel;
      const { resolution } = channel;
      const title = channel.network;

      if (selResolution === resMap[resolution as keyof typeof resMap]) {
        resCounts[title] = resCounts[title] ? resCounts[title] + 1 : 1;
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
    const resolutionData: Array<Record<string, any>> = [];
    const resolutionKeys: string[] = [];
    Object.keys(resCounts).forEach((key) => {
      if (!selResolution) {
        resolutionData.push({
          resolution: resMap[key as keyof typeof resMap],
          resolutions: resCounts[key],
        });
        resolutionKeys.push('resolutions');
      } else {
        resolutionData.push({
          resolution: key,
          channels: resCounts[key],
        });
        resolutionKeys.push('channels');
      }
    });
    resolutionData.sort((a, b) => (a.resolution > b.resolution ? 1 : -1));
    this.setState({
      recTotal,
      resolutionData,
      resolutionKeys: [...new Set(resolutionKeys)],
    });
  }

  render() {
    const { recTotal, selResolution, resolutionData, resolutionKeys } =
      this.state;
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
          onClick={!selResolution ? this.chartClick : () => undefined}
          back={selResolution ? this.clearResolution : null}
        />
      </Col>
    );
  }
}
