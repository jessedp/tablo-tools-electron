import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import { LinkContainer } from 'react-router-bootstrap';
import { Alert, Button } from 'react-bootstrap';
import routes from '../constants/routes.json';
import Airing from '../utils/Airing';
import { asyncForEach } from '../utils/utils';
import ShowCover from './ShowCover';

type Props = Record<string, never>;
type State = {
  events: Array<Airing>;
  alertType: string;
  alertTxt: string;
  loaded: boolean;
};
export default class Sports extends Component<Props, State> {
  // initialState: State;

  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      events: [],
      alertType: '',
      alertTxt: '',
      loaded: false,
    };
    this.psToken = '';
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): any {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    const objRecs = await eventList();
    const label = objRecs.length === 1 ? 'event' : 'events';
    this.setState({
      events: objRecs,
      alertType: 'info',
      alertTxt: `${objRecs.length} ${label} found`,
      loaded: true,
    });
  };

  render() {
    const { events, loaded, alertTxt, alertType } = this.state;
    if (!loaded) return <></>; //

    if (events.length === 0) {
      return (
        <Alert variant="danger" className="full-alert p-3 mt-3">
          <span className="fa fa-exclamation mr-2" />
          No Sports or Events found.
        </Alert>
      );
    }

    return (
      <div className="section">
        <div>
          {alertTxt ? (
            <Alert className="fade m-2" variant={alertType}>
              {alertTxt}
            </Alert>
          ) : (
            ''
          )}
        </div>
        <div className="scrollable-area">
          {events.map((rec) => {
            return (
              <LinkContainer
                to={routes.EVENTDETAILS.replace(':id', `${rec.id}`)}
                key={rec.id}
              >
                <Button
                  variant="light"
                  className="align-content-center"
                  key={rec.id}
                >
                  <ShowCover show={rec.show} key={`event-${rec.id}`} />;
                </Button>
              </LinkContainer>
            );
          })}
        </div>
      </div>
    );
  }
}
export async function eventList() {
  const recType = new RegExp('sports');
  const recs = await window.db.asyncFind('RecDb', {
    path: {
      $regex: recType,
    },
  });
  const objRecs: Array<Airing> = [];
  await asyncForEach(recs, async (rec) => {
    const airing = await Airing.create(rec);
    objRecs.push(airing);
  });

  const titleSort = (a: Airing, b: Airing) => {
    if (a.show.sortableTitle > b.show.sortableTitle) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));
  return objRecs;
}
