// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sticky from 'react-sticky-el';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';

import { Button } from 'react-bootstrap';
import * as ActionListActions from '../actions/actionList';
import Airing from '../utils/Airing';

import { asyncForEach } from '../utils/utils';
import TabloImage from './TabloImage';
import Show from '../utils/Show';
import SeasonEpisodeList from './SeasonEpisodeList';

type Props = {
  show: Show,
  selectedCount: number,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void
};
type State = {
  airings: Array<Airing>,
  episodes: Object,
  seasons: Object,
  selSeason: null,
  seasonRefs: Object
};

class EpisodeList extends Component<Props, State> {
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

    (this: any).search = this.search.bind(this);
    (this: any).selectSeason = this.selectSeason.bind(this);
    (this: any).setSeasonRefs = this.setSeasonRefs.bind(this);
  }

  async componentDidMount() {
    await this.search();
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;
    if (prevProps.selectedCount !== selectedCount) {
      this.render();
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

  async search() {
    const { show } = this.props;

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
    const { airings, episodes, seasons, seasonRefs } = this.state;
    const { selectedCount } = this.props;
    const { show, bulkAddAirings, bulkRemAirings } = this.props;

    return (
      <>
        <div>
          <Row>
            <Col md="auto" className="ml-2 badge-light pt-2">
              <TabloImage
                imageId={show.thumbnail}
                className="cover-image"
                title={show.title}
              />
            </Col>
            <Col className="pt-5">
              <Row>
                <Col md="auto">
                  <h4>{show.title}</h4>
                </Col>
                <Col>
                  <Badge className="p-2" variant="dark">
                    {airings.length} episode{airings.length > 1 ? 's' : ''}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Button
                  size="xs"
                  className="ml-3 mr-2"
                  variant="outline-secondary"
                  onClick={() => bulkAddAirings(airings)}
                >
                  <span className="fa fa-plus" /> All Episodes
                </Button>
                <Button
                  size="xs"
                  className="mr-2"
                  variant="outline-secondary"
                  onClick={() => bulkRemAirings(airings)}
                >
                  <span className="fa fa-minus" /> All Episodes
                </Button>
                <div className="text-secondary ml-3 smaller">
                  <span className="fa fa-shopping-cart pr-2" />
                  {selectedCount}
                </div>
              </Row>
            </Col>
          </Row>
        </div>
        <div className="scrollable-area">
          <Row className="mb-4">
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
      </> //
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
    <div className="mt-2" style={{ width: '100px', cursor: 'pointer' }}>
      <Sticky stickyStyle={{ zIndex: '10000' }}>
        <ListGroup
          as="ul"
          className="bg-white"
          style={{ zIndex: '10000', width: '100px' }}
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
)(EpisodeList);
