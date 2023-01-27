import { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import MediumPie from './MediumPie';

type Props = Record<string, undefined>;
type State = {
  recTotal: number;
  watchedData: Array<Record<string, any>>;
  stateData: Array<Record<string, any>>;
  typeData: Array<Record<string, any>>;
};
export default class DbStats extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      watchedData: [],
      stateData: [],
      typeData: [],
    };
    this.psToken = '';
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
    this.refresh();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    // const { RecDb } = global;
    const recTotal = window.db.countAsync('RecDb', {});

    /** Watched * */
    const watched = window.db.countAsync('RecDb', {
      'user_info.watched': true,
    });
    const watchedData = [
      {
        id: 'watched',
        label: 'watched',
        value: watched,
      },
      {
        id: 'unwatched',
        label: 'unwatched',
        value: recTotal - watched,
      },
    ];

    /** by state * */
    const finished = window.db.countAsync('RecDb', {
      'video_details.state': 'finished',
    });
    const failed = window.db.countAsync('RecDb', {
      'video_details.state': 'failed',
    });
    const recording = window.db.countAsync('RecDb', {
      'video_details.state': 'recording',
    });
    const stateData = [
      {
        id: 'finished',
        label: 'finished',
        value: finished,
      },
      {
        id: 'failed',
        label: 'failed',
        value: failed,
      },
      {
        id: 'in-progress',
        label: 'in progress',
        value: recording,
      },
    ];

    /** by type * */
    let recType = /episode/;
    const typeEpisode = window.db.countAsync('RecDb', {
      path: {
        $regex: recType,
      },
    });
    recType = /movie/;
    const typeMovie = window.db.countAsync('RecDb', {
      path: {
        $regex: recType,
      },
    });
    recType = /sports/;
    const typeEvent = window.db.countAsync('RecDb', {
      path: {
        $regex: recType,
      },
    });
    recType = /programs/;
    const typeProgram = window.db.countAsync('RecDb', {
      path: {
        $regex: recType,
      },
    });
    const typeData = [
      {
        id: 'episode',
        label: 'episode',
        value: typeEpisode,
      },
      {
        id: 'movie',
        label: 'movie',
        value: typeMovie,
      },
      {
        id: 'event',
        label: 'event',
        value: typeEvent,
      },
      {
        id: 'manual',
        label: 'manual',
        value: typeProgram,
      },
    ];
    this.setState({
      recTotal,
      watchedData,
      stateData,
      typeData,
    });
  }

  render() {
    const { recTotal, watchedData, stateData, typeData } = this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    return (
      <div>
        {/* total recordings */}
        <div className="stats-header">all recordings</div>
        <MediumPie data={watchedData} scheme="accent" />

        <div className="stats-header">by status</div>
        {/* by state */}
        <MediumPie data={stateData} scheme="accent" />
        <div className="stats-header">by type</div>
        {/* by type */}
        <MediumPie data={typeData} scheme="category10" />
      </div>
    );
  }
}
