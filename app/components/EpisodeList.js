// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sticky from 'react-sticky-el';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';

import { Button } from 'react-bootstrap';
import * as ActionListActions from '../actions/actionList';
import Airing from '../utils/Airing';
import RecordingSlim from './RecordingSlim';
import { asyncForEach } from '../utils/utils';
import TabloImage from './TabloImage';
import Show from '../utils/Show';

type Props = {
  show: Show,
  selectedCount: number,
  addShow: Show => void,
  remShow: Show => void
};
type State = {
  episodes: Object,
  seasons: Object,
  count: number,
  selSeason: null,
  seasonRefs: Object
};

class EpisodeList extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = {
      episodes: {},
      seasons: {},
      count: 0,
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

    const objRecs = [];
    const seasons = {};
    const refs = {};
    const result = {};

    await asyncForEach(recs, async rec => {
      const airing = await Airing.create(rec);
      objRecs.push(airing);
      // console.log(airing);
      const seasonNo = airing.episode.season_number;
      if (!(seasonNo in seasons)) {
        result[seasonNo] = [];
        seasons[seasonNo] = [];
      }
      refs[`season-${seasonNo}`] = React.createRef();
      seasons[seasonNo].push(airing.episode.number);
    });

    if (!objRecs || objRecs.length === 0) {
      await this.setState({ count: 0 });
    } else {
      this.setState({
        episodes: (
          <Container>
            <Row className="pl-lg-5">
              <Spinner animation="grow" variant="info" />
            </Row>
          </Container>
        )
      });

      objRecs.forEach(airing => {
        result[airing.episode.season_number].push(
          <RecordingSlim
            key={airing.object_id}
            airing={airing}
            doDelete={() => {}}
            withShow={0}
          />
        );
      });
    }
    await this.setState({
      episodes: result,
      seasons,
      seasonRefs: refs,
      count: objRecs.length
    });
  }

  render() {
    const { count, episodes, seasons, seasonRefs } = this.state;
    const { selectedCount, addShow, remShow } = this.props;
    const { show } = this.props;

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
                    {count} episode{count > 1 ? 's' : ''}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Button
                  size="xs"
                  className="ml-3 mr-2"
                  variant="outline-secondary"
                  onClick={() => addShow(show)}
                >
                  <span className="fa fa-plus" /> All Episodes
                </Button>
                <Button
                  size="xs"
                  className="mr-2"
                  variant="outline-secondary"
                  onClick={() => remShow(show)}
                >
                  <span className="fa fa-minus" /> All Episodes
                </Button>
                <Badge>{selectedCount}</Badge>
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
              <FullList
                episodes={episodes}
                seasons={seasons}
                seasonRefs={seasonRefs}
              />
            </Col>
          </Row>
        </div>
      </> //
    );
  }
}

function FullList(prop) {
  const { seasons, episodes, seasonRefs } = prop;
  const output = [];

  Object.keys(seasons).forEach(key => {
    const refKey = `season-${key}`;
    const count = episodes[key].length;
    output.push(
      <div className="pt-2" key={refKey} ref={seasonRefs[refKey]}>
        <Alert variant="light" key={refKey}>
          <span className="mr-3">Season {key}</span>
          <Badge className="p-2" variant="primary">
            {count} episode{count > 1 ? 's' : ''}
          </Badge>
        </Alert>
      </div>
    );

    episodes[key].forEach(rec => {
      output.push(rec);
    });
  });

  return output;
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
    (a, b) => a + (b.show.object_id === show.object || 0),
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
