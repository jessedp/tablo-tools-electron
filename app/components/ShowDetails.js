// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import { format } from 'date-fns';

import Sticky from 'react-sticky-el';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';

import { Button } from 'react-bootstrap';
import * as ActionListActions from '../actions/actionList';
import Airing from '../utils/Airing';

import routes from '../constants/routes.json';

import {
  asyncForEach,
  getTabloImageUrl,
  readableDuration
} from '../utils/utils';
import TabloImage from './TabloImage';
import Show from '../utils/Show';
import SeasonEpisodeList from './SeasonEpisodeList';
import AwardsModal from './AwardsModal';

type Props = {
  //  show: Show,
  selectedCount: number,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void,
  match: any
};
type State = {
  show?: Show,
  airings: Array<Airing>,
  episodes: Object,
  seasons: Object,
  selSeason: null,
  seasonRefs: Object
};

class ShowDetails extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = {
      airings: [],
      episodes: {},
      seasons: {},
      selSeason: null,
      seasonRefs: []
    };

    this.state = this.initialState;

    (this: any).refresh = this.refresh.bind(this);
    (this: any).selectSeason = this.selectSeason.bind(this);
    (this: any).setSeasonRefs = this.setSeasonRefs.bind(this);
  }

  async componentDidMount() {
    // eslint-disable-next-line
    const id = parseInt(this.props.match.params.id, 10);
    const rec = await global.ShowDb.asyncFindOne({
      object_id: id
    });

    this.setState({ show: new Show(rec) });
    this.refresh();
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;
    if (prevProps.selectedCount !== selectedCount) {
      this.refresh();
    }
  }

  setSeasonRefs(refs: Object) {
    console.log('created season refs', refs.length);
    this.setState({ seasonRefs: refs });
  }

  selectSeason(season: string) {
    const { seasonRefs } = this.state;
    console.log('selected season', season);

    if (season === 'top') {
      window.scrollTo(0, 0);
    } else {
      seasonRefs[season].current.scrollIntoView({
        block: 'start'
      });
    }
  }

  async refresh() {
    const { show } = this.state;

    if (!show) return;

    const query = {
      series_path: show.path
    };

    const recs = await global.RecDb.asyncFind(query, [
      [
        'sort',
        {
          'episode.season_number': 1,
          'episode.number': 1,
          'airing_details.datetime': -1
        }
      ]
    ]);

    const airings = [];
    const seasons = {};
    const episodes = {};
    const refs = {};

    await asyncForEach(recs, async rec => {
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
      airings,
      episodes,
      seasons,
      seasonRefs: refs
    });
  }

  render() {
    const { show, airings, episodes, seasons, seasonRefs } = this.state;
    const { selectedCount } = this.props;
    const { bulkAddAirings, bulkRemAirings } = this.props;

    if (!show) return <></>; //

    const airDate = (date: string) => {
      // TODO: this is a wrong but "probably will work" assumption
      let plusTZ = `${date} 12:00 EST`;
      console.log('1', date);
      plusTZ = new Date(Date.parse(plusTZ)).toLocaleString();
      console.log('2', plusTZ);
      // 2009-09-23
      return format(Date.parse(plusTZ), 'EE MMM do, yyyy');
    };

    //            style={{
    //   backgroundImage: `url(${getTabloImageUrl(show.background)})`
    // }}
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
            zIndex: '-1',
            maxHeight: '90vh'
          }}
        />

        <div style={{}}>
          <LinkContainer to={routes.SHOWS} key={show.id}>
            <Button size="xs" variant="outline-secondary" className="mt-1 mb-1">
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

              <div className="p-3" style={{ maxWidth: '80vw' }}>
                <Row>
                  <Col>
                    Originally aired
                    <span className="ml-1">
                      {airDate(show.series.orig_air_date)}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <b>Cast:</b>
                    <span className="ml-1">{show.series.cast.join(', ')}</span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <AwardsModal show={show} />
                  </Col>
                </Row>
              </div>

              <Row>
                <Button
                  size="xs"
                  className="ml-3 mr-2"
                  variant="outline-dark"
                  onClick={() => bulkAddAirings(airings)}
                >
                  <span className="fa fa-plus" /> All Episodes
                </Button>
                <Button
                  size="xs"
                  className="mr-2"
                  variant="outline-dark"
                  onClick={() => bulkRemAirings(airings)}
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
              {Object.keys(seasons).map(key => {
                const refKey = `season-${key}`;
                return (
                  <SeasonEpisodeList
                    key={refKey}
                    show={show}
                    seasonNumber={key}
                    airings={episodes[key]}
                    ref={seasonRefs[key]}
                    refKey={refKey}
                  />
                );
              })}
            </Col>
          </Row>
        </div>
      </div> //
    );
  }
}

// TODO: Convert to class
function SeasonList(prop) {
  // const [active, setActive] = useState(0);
  const active = false;
  const setActive = key => key;
  const { seasons, selectSeason } = prop;
  const output = [];
  let first = true;
  Object.keys(seasons).forEach(key => {
    let listKey = `season-${key}`;
    if (first) {
      listKey = 'top';
      first = false;
    }

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
    <div className="mt-2" style={{ width: '120px', cursor: 'pointer' }}>
      <Sticky stickyStyle={{ zIndex: '10000' }}>
        <ListGroup
          as="ul"
          className="bg-white"
          style={{ zIndex: '10000', width: '120px' }}
        >
          {output}
        </ListGroup>
      </Sticky>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  const { show } = ownProps;
  const selectedCount = actionList.reduce(
    (a, b) => a + (b.show.object_id === show.object_id || 0),
    0
  );
  return {
    selectedCount
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ShowDetails));
