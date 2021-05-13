import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import MediumPie from './MediumPie';

type Props = {};
type State = {
  recTotal: number;
  watchedData: Array<{}>;
  stateData: Array<{}>;
  typeData: Array<{}>;
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
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    const { RecDb } = global;
    const recTotal = await RecDb.asyncCount({});

    /** Watched * */
    const watched = await RecDb.asyncCount({
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
    const finished = await RecDb.asyncCount({
      'video_details.state': 'finished',
    });
    const failed = await RecDb.asyncCount({
      'video_details.state': 'failed',
    });
    const recording = await RecDb.asyncCount({
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
    let recType = new RegExp('episode');
    const typeEpisode = await RecDb.asyncCount({
      path: {
        $regex: recType,
      },
    });
    recType = new RegExp('movie');
    const typeMovie = await RecDb.asyncCount({
      path: {
        $regex: recType,
      },
    });
    recType = new RegExp('sports');
    const typeEvent = await RecDb.asyncCount({
      path: {
        $regex: recType,
      },
    });
    recType = new RegExp('programs');
    const typeProgram = await RecDb.asyncCount({
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
