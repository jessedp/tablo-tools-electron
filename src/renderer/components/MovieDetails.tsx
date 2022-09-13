import { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

import * as ActionListActions from '../store/actionList';
import Airing from '../utils/Airing';
import routes from '../constants/routes.json';
import { getTabloImageUrl, readableDuration } from '../utils/utils';

import TabloImage from './TabloImage';
import AwardsModal from './AwardsModal';
import AiringDetailsModal from './AiringDetailsModal';
import TabloVideoPlayer from './TabloVideoPlayer';
import VideoExportModal from './VideoExportModal';
import { StdObj } from '../constants/app';

// interface Props extends PropsFromRedux {}

type State = {
  movie: Airing | null;
};

interface RouterProps {
  // type for `match.params`
  id: string; // must be type `string` since value comes from the URL
}

type OwnProps = RouteComponentProps<RouterProps>;
type Props = OwnProps & PropsFromRedux;

class MovieDetails extends Component<Props, State> {
  initialState: State;

  constructor(props: Props) {
    super(props);
    this.initialState = {
      movie: null,
    };
    this.state = this.initialState;
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    // eslint-disable-next-line
    const id = parseInt(this.props.match.params.id, 10);
    const rec = await window.db.findOneAsync('RecDb', {
      object_id: id,
    });
    const movie = await Airing.create(rec);
    this.refresh(movie);
  }

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;

    if (prevProps.selectedCount !== selectedCount) {
      this.refresh();
    }
  }

  async refresh(movie: Airing | null = null) {
    if (!movie) return;
    this.setState({
      movie,
    });
  }

  render() {
    const { movie } = this.state;
    const { selectedCount } = this.props;
    const { addAiring, remAiring } = this.props;
    if (!movie) return <></>;

    const { show } = movie;
    return (
      <div className="section overflow-hidden">
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
            zIndex: -1, // maxHeight: '90vh'
          }}
        />

        <div>
          <LinkContainer to={routes.MOVIES} key={show.id}>
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
                    {show.movie.film_rating}
                  </Badge>
                  <Badge pill className="mt-1 ml-1 mr-1" variant="light">
                    {readableDuration(show.movie.original_runtime)}
                  </Badge>
                </Col>
              </Row>

              <Row className="ml-0">
                <AiringDetailsModal airing={movie} />
                &nbsp;
                <TabloVideoPlayer airing={movie} />
                &nbsp;
                <VideoExportModal airing={movie} />
                <Button
                  size={'xs' as any}
                  className="ml-3 mr-2"
                  variant="outline-dark"
                  onClick={() => addAiring(movie.data)}
                >
                  <span className="fa fa-plus" />
                </Button>
                <Button
                  size={'xs' as any}
                  className="mr-2"
                  variant="outline-dark"
                  onClick={() => remAiring(movie.data)}
                >
                  <span className="fa fa-minus" />
                </Button>
                <div className="center-icon smaller text-dark">
                  <span className="fa fa-shopping-cart pr-2" />
                  {selectedCount}
                </div>
              </Row>

              <div
                className="p-3"
                style={{
                  maxWidth: '80vw',
                }}
              >
                <Row>
                  <Col>
                    <b>Released:</b>
                    <span className="ml-1">{show.movie.release_year}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <b>Plot:</b>
                    <span className="ml-1">{show.movie.plot}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <b>Cast:</b>
                    <span className="ml-1">{show.movie.cast.join(', ')}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <AwardsModal awards={show.movie.awards} />
                  </Col>
                </Row>
              </div>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any, ownProps: OwnProps) => {
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

export default connector(withRouter(MovieDetails));
