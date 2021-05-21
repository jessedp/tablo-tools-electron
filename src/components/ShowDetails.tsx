import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { format } from 'date-fns';
import Sticky from 'react-sticky-el';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';

import * as ActionListActions from '../store/actionList';

import Airing from '../utils/Airing';
import routes from '../constants/routes.json';
import { StdObj } from '../constants/app';
import {
  asyncForEach,
  getTabloImageUrl,
  readableDuration,
} from '../utils/utils';
import TabloImage from './TabloImage';
import Show from '../utils/Show';
import SeasonEpisodeList from './SeasonEpisodeList';
import AwardsModal from './AwardsModal';

// interface Props extends PropsFromRedux {
//   // show: Show,
//   selectedCount: number;
//   match: any;
// };

type State = {
  show: Show | null;
  airings: Array<Airing>;
  episodes: Record<string, any>;
  seasons: Record<string, any>;
  selSeason: null;
  seasonRefs: Record<string, any>;
};

class ShowDetails extends Component<
  RouteComponentProps & PropsFromRedux,
  State
> {
  initialState: State;

  constructor(props: RouteComponentProps & PropsFromRedux) {
    super(props);
    this.initialState = {
      airings: [],
      episodes: {},
      seasons: {},
      selSeason: null,
      seasonRefs: [],
      show: null,
    };
    this.state = this.initialState;
    (this as any).refresh = this.refresh.bind(this);
    (this as any).selectSeason = this.selectSeason.bind(this);
    (this as any).setSeasonRefs = this.setSeasonRefs.bind(this);
  }

  async componentDidMount() {
    // eslint-disable-next-line
    const id = parseInt(this.props.match.params.id, 10);
    const rec = await global.ShowDb.asyncFindOne({
      object_id: id,
    });
    const show = new Show(rec);
    this.refresh(show);
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;

    if (prevProps.selectedCount !== selectedCount) {
      this.refresh();
    }
  }

  setSeasonRefs(refs: Record<string, any>) {
    console.log('created season refs', refs.length);
    this.setState({
      seasonRefs: refs,
    });
  }

  selectSeason(season: string) {
    const { seasonRefs } = this.state;
    console.log('selected season', season);

    if (season === 'top') {
      window.scrollTo(0, 0);
    } else {
      seasonRefs[season].current.scrollIntoView({
        block: 'start',
      });
    }
  }

  async refresh(show: Show | null = null) {
    if (!show) return;
    const query = {
      series_path: show.path,
    };
    const recs = await global.RecDb.asyncFind(query, [
      [
        'sort',
        {
          'episode.season_number': 1,
          'episode.number': 1,
          'airing_details.datetime': -1,
        },
      ],
    ]);
    const airings: Array<Airing> = [];
    const seasons: Record<string, any> = {};
    const episodes: Record<string, any> = {};
    const refs: Record<string, any> = {};
    await asyncForEach(recs, async (rec) => {
      const airing = await Airing.create(rec);
      airings.push(airing);
      const seasonNo = airing.episode.season_number;

      if (!(seasonNo in seasons)) {
        episodes[seasonNo] = [];
        seasons[seasonNo] = [];
      }

      episodes[seasonNo].push(airing);
      refs[`season-${seasonNo}`] = React.createRef();
      seasons[seasonNo].push(airing.episode.number);
    });
    await this.setState({
      show,
      airings,
      episodes,
      seasons,
      seasonRefs: refs,
    });
  }

  render() {
    const { show, airings, episodes, seasons, seasonRefs } = this.state;
    const { selectedCount } = this.props;
    const { bulkAddAirings, bulkRemAirings } = this.props;
    if (!show || !show.id) return <></>; //

    const airDate = (date: string) => {
      // TODO: this is a wrong but "probably will work" assumption
      let plusTZ = `${date} 12:00 EST`;
      plusTZ = new Date(Date.parse(plusTZ)).toLocaleString();
      // Tues Jan 1st, 1999
      return format(Date.parse(plusTZ), 'EE MMM do, yyyy');
    };

    return (
      <div className="section">
        <img
          alt="background"
          src={getTabloImageUrl(show.background)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: 'auto',
            opacity: '0.25',
            zIndex: -1,
            maxHeight: '91vh',
          }}
        />

        <div>
          <LinkContainer to={routes.SHOWS} key={show.id}>
            <Button
              size={'xs' as any}
              variant="outline-secondary"
              className="mt-1 mb-1"
            >
              <span className="fa fa-arrow-left pr-2" />
              back
            </Button>
          </LinkContainer>
          <Row>
            <Col md="auto" className="">
              <TabloImage
                imageId={show.thumbnail}
                className="cover-image"
                title={show.title}
              />
            </Col>

            <div className="show-cover">
              <Row className="pt-1">
                <Col md="auto">
                  <h2 className="text-primary">{show.title}</h2>
                </Col>
                <Col>
                  <Badge
                    pill
                    className="mt-1 ml-1 mr-1 text-uppercase"
                    variant="light"
                  >
                    {show.series.series_rating}
                  </Badge>
                  <Badge pill className="mt-1 ml-1 mr-1" variant="light">
                    {readableDuration(show.series.episode_runtime)}
                  </Badge>
                  <Badge className="p-2 mt-1" variant="dark">
                    {airings.length} episode{airings.length > 1 ? 's' : ''}
                  </Badge>
                </Col>
              </Row>

              <div
                className="p-3"
                style={{
                  maxWidth: '80vw',
                }}
              >
                <Row>
                  <Col>
                    Originally aired
                    <span className="ml-1">
                      {airDate(show.series.orig_air_date)}
                    </span>
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <b>Cast:</b>
                    <span className="ml-1">{show.series.cast.join(', ')}</span>
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <AwardsModal awards={show.series.awards} />
                  </Col>
                </Row>
              </div>

              <Row>
                <Button
                  size={'xs' as any}
                  className="ml-3 mr-2"
                  variant="outline-dark"
                  onClick={() => bulkAddAirings(airings.map((a) => a.data))}
                >
                  <span className="fa fa-plus" /> All Episodes
                </Button>
                <Button
                  size={'xs' as any}
                  className="mr-2"
                  variant="outline-dark"
                  onClick={() => bulkRemAirings(airings.map((a) => a.data))}
                >
                  <span className="fa fa-minus" /> All Episodes
                </Button>

                <div className="center-icon smaller text-dark">
                  <span className="fa fa-shopping-cart pr-2" />
                  {selectedCount}
                </div>
              </Row>
            </div>
          </Row>
        </div>

        <div className="scrollable-area">
          <Row>
            <Col md="auto">
              <SeasonList seasons={seasons} selectSeason={this.selectSeason} />
            </Col>
            <Col>
              {Object.keys(seasons).map((key) => {
                const refKey = `season-${key}`;
                const wrapKey = `seasonwrap-${key}`;
                return (
                  <div key={wrapKey}>
                    <span ref={seasonRefs[refKey]} />
                    <SeasonEpisodeList
                      key={refKey}
                      show={show}
                      seasonNumber={key}
                      airings={episodes[key]}
                      refKey={refKey}
                    />
                  </div> //
                );
              })}
            </Col>
          </Row>
        </div>
      </div>
    );
  }
} // TODO: Convert to class

function SeasonList(prop: any) {
  // const [active, setActive] = useState(0);
  const active = '';

  const setActive = (key: string) => key;

  const { seasons, selectSeason } = prop;
  const output: Array<JSX.Element> = [];
  Object.keys(seasons).forEach((key) => {
    const listKey = `season-${key}`;
    const isActive = active === key;
    output.push(
      <ListGroup.Item
        as="li"
        key={listKey}
        action
        active={isActive}
        onClick={() => {
          setActive(key);
          selectSeason(listKey);
        }}
      >
        Season {key}
      </ListGroup.Item>
    );
  });
  return (
    <div
      className="mt-2"
      style={{
        width: '120px',
        cursor: 'pointer',
      }}
    >
      <Sticky
        stickyStyle={{
          zIndex: 10000,
        }}
        scrollElement=".scrollable-area"
      >
        <ListGroup
          as="ul"
          className="bg-white"
          style={{
            zIndex: 10000,
            width: '120px',
          }}
        >
          {output}
        </ListGroup>
      </Sticky>
    </div>
  );
}

const mapStateToProps = (state: any, ownProps: any) => {
  // eslint-disable-next-line
  const id = parseInt(ownProps.match.params.id, 10);
  const selectedCount = state.actionList.records.reduce(
    (a: number, b: StdObj) => a + (b.object_id === id ? 1 : 0),
    0
  );
  return {
    selectedCount,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(ShowDetails));
