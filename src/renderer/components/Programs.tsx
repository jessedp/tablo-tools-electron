import { Component } from 'react';
import PubSub from 'pubsub-js';
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import routes from '../constants/routes.json';
import Airing from '../utils/Airing';
import { asyncForEach } from '../utils/utils';
import ProgramCover from './ProgramCover';
import { YES } from '../constants/app';
import { ProgramData } from '../constants/types_airing';
// import ProgramEpisodeList from './ProgramEpisodeList';

type Props = Record<string, never>;
type State = {
  airings: ProgramData[];
  alertType: string;
  alertTxt: string;
  loaded: boolean;
};
export default class Programs extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      airings: [],
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
    const recs = await programList();
    this.setState({
      airings: recs,
      alertType: 'info',
      alertTxt: `${recs.length} manual recordings found`,
      loaded: true,
    });
  };

  render() {
    const { airings, loaded, alertTxt, alertType } = this.state;
    if (!loaded) return <></>; //

    if (airings.length === 0) {
      return (
        <Alert variant="danger" className="full-alert p-3 mt-3">
          <span className="fa fa-exclamation mr-2" />
          No Manual Records found.
        </Alert>
      );
    }

    return (
      <div className="section">
        <div>
          <Alert variant={alertType}>{alertTxt}</Alert>
        </div>

        <div className="scrollable-area">
          {airings.map((rec) => {
            const key = `program-${rec.airing.id}`;
            return (
              <LinkContainer
                to={routes.PROGRAMDETAILS.replace(':path', rec.path)}
                key={rec.airing.id}
              >
                <Button variant="light" className="mr-3">
                  <ProgramCover rec={rec} showCheckbox={YES} key={key} />;
                </Button>
              </LinkContainer>
            );
          })}
        </div>
      </div>
    );
  }
}
export async function programList(progPath = '') {
  let recs = [];

  if (progPath) {
    recs = await window.db.findAsync('RecDb', {
      program_path: progPath,
    });
  } else {
    const recType = new RegExp('program');
    recs = await window.db.findAsync('RecDb', {
      path: {
        $regex: recType,
      },
    });
  }

  const objs: Record<string, ProgramData> = {};
  const newRecs: Airing[] = [];
  await await asyncForEach(recs, async (rec) => {
    const airing = await Airing.create(rec);
    newRecs.push(airing);
  });
  newRecs.sort((a, b) =>
    a.airingDetails.datetime > b.airingDetails.datetime ? 1 : -1
  );
  newRecs.forEach((rec) => {
    const path = rec.program_path.trim();

    if (Object.prototype.hasOwnProperty.call(objs, path)) {
      objs[path].count += 1;

      if (!rec.userInfo.watched) {
        objs[rec.program_path].unwatched += 1;
      }

      objs[rec.program_path].airings.push(rec);
    } else {
      const airings = [rec];
      objs[path] = {
        path: btoa(path),
        airing: rec,
        airings,
        count: 1,
        unwatched: rec.userInfo.watched ? 0 : 1,
      };
    }
  });
  const objRecs: ProgramData[] = Object.keys(objs).map((id) => objs[id]);

  const titleSort = (a: ProgramData, b: ProgramData) => {
    if (a.airing.title > b.airing.title) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));

  if (progPath) {
    return [objRecs[0]];
  }

  return objRecs;
} // export async function programsByProgramList(path: string) {
//   const recs = await window.db.findAsync('RecDb', { program_path: { $eq: path } });
//   const objRecs = [];
//   await asyncForEach(recs, async rec => {
//     const airing = await Airing.create(rec);
//     objRecs.push(airing);
//   });
//   const titleSort = (a, b) => {
//     if (a.datetime > b.datetime) return 1;
//     return -1;
//   };
//   objRecs.sort((a, b) => titleSort(a, b));
//   return objRecs;
// }
