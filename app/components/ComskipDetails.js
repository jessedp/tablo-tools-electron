// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Alert from 'react-bootstrap/Alert';
import compareVersions from 'compare-versions';
import MediumPie from './MediumPie';

const Store = require('electron-store');

const store = new Store();

type Props = {};
type State = {
  skipStats: Object,
  skipErrors: Object,
  showsData: Array<Object>,
  recCount: number
};

export default class ComskipDetails extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { skipStats: {}, skipErrors: {}, recCount: 0, showsData: [] };

    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  psToken = null;

  async refresh() {
    const currentDevice = store.get('CurrentDevice');
    let comskipAvailable = false;
    if (currentDevice.server_version) {
      const testVersion = currentDevice.server_version.match(/[\d.]*/)[0];
      comskipAvailable = compareVersions(testVersion, '2.2.26') >= 0;
    }
    if (!comskipAvailable) return;

    // const comskip = await RecDb.asyncCount({ 'video_details.comskip': { $exists: true } });
    const recs = await global.RecDb.asyncFind({});

    const skipStats = { ready: 0, none: 0, error: 0 };
    const skipErrors = {};

    const shows = {};
    recs.forEach(rec => {
      const cs = rec.video_details.comskip;
      const title = rec.airing_details.show_title;

      skipStats[cs.state] = skipStats[cs.state] ? skipStats[cs.state] + 1 : 1;
      if (cs.state === 'ready')
        shows[title] = shows[title] ? shows[title] + 1 : 1;

      // TODO: missing comskip?
      if (cs && cs.error) {
        if (cs.error in skipErrors) {
          skipErrors[cs.error] += 1;
        } else {
          skipErrors[cs.error] = 0;
        }
      }
    });

    const showsData = [];
    Object.keys(shows).forEach(key => {
      showsData.push({ id: key, label: key, value: shows[key] });
    });

    await this.setState({
      recCount: recs.length,
      skipStats,
      skipErrors,
      showsData
    });
  }

  render() {
    const { recCount, skipStats, skipErrors, showsData } = this.state;

    if (!skipStats) return <></>;

    if (!recCount)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    const data = [];
    Object.keys(skipErrors).forEach(key => {
      data.push({ id: key, label: key, value: skipErrors[key] });
    });

    const topStats = [
      { id: 'ready', label: 'ready', value: skipStats.ready },
      { id: 'errors', label: 'errors', value: skipStats.error },
      { id: 'unknown', label: 'unknown', value: skipStats.none }
    ];

    return (
      <>
        <MediumPie data={topStats} scheme="accent" />

        <h6>by show</h6>
        <MediumPie data={showsData} scheme="set2" />
        <h6>error details</h6>
        <MediumPie data={data} scheme="set2" />
      </>
    );
  }
}
