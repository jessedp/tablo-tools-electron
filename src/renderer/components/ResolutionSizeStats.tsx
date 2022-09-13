import { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';

import MediumPie from './MediumPie';
import { readableBytes } from '../utils/utils';

type Props = Record<string, never>;
type State = {
  recTotal: number;
  resData: Array<Record<string, any>>;
};
export default class ResolutionSizeStats extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      resData: [],
    };
    this.psToken = '';
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): any {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    // const { RecDb } = global;
    const recTotal = await window.db.countAsync('RecDb', {});
    const recs = await window.db.findAsync('RecDb', {});
    const res: Record<string, any> = {};
    recs.forEach((rec: Record<string, any>) => {
      const currentRes: string = rec.airing_details.channel.channel.resolution;
      const { size } = rec.video_details;
      res[currentRes] = res[currentRes] ? res[currentRes] + size : size;
    });
    const resMap = {
      hd_1080: 'HD 1080',
      hd_720: 'HD 720',
      sd: 'SD',
    };
    const resData: Array<Record<string, any>> = [];
    Object.keys(res).forEach((key) => {
      resData.push({
        id: resMap[key as keyof typeof resMap],
        label: readableBytes(res[key]),
        value: res[key],
      });
    });
    this.setState({
      recTotal,
      resData,
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
          totalFormat={(val) => {
            return readableBytes(val);
          }}
        />
      </div>
    );
  }
}
