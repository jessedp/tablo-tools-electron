import { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Badge, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import * as ActionListActions from '../store/actionList';
import { StdObj } from '../constants/types';
import { ON, OFF, NO } from '../constants/app';
import { ProgramData } from '../constants/types_airing';
import RecordingSlim from './RecordingSlim';
import ProgramCover from './ProgramCover';
import { programList } from './Programs';
import routes from '../constants/routes.json';

type State = {
  rec: ProgramData | null;
};

interface RouterProps {
  // type for `match.params`
  path: string; // must be type `string` since value comes from the URL
}
type Props = PropsFromRedux & RouteComponentProps<RouterProps>;

class ProgramEpisodeList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rec: null,
    };
  }

  componentDidMount = async () => {
    const { match } = this.props;

    // eslint-disable-next-line
    const path = match?.params?.path;
    console.log('match|', match);
    const recs = await programList(atob(path));
    this.refresh(recs[0]);
  };

  componentDidUpdate(prevProps: Props) {
    const { selectedCount } = this.props;

    if (prevProps.selectedCount !== selectedCount) {
      this.render();
    }
  }

  refresh = (rec: ProgramData) => {
    this.setState({
      rec,
    });
  };

  render() {
    const { rec } = this.state;
    if (!rec) return <></>; //

    const { selectedCount, bulkAddAirings, bulkRemAirings } = this.props;
    const { airings } = rec;
    return (
      <div className="section">
        <div>
          <LinkContainer to={routes.PROGRAMS}>
            <Button
              size={'xs' as any}
              variant="outline-secondary"
              className="mt-1 mb-1"
            >
              <span className="fa fa-arrow-left pr-2" />
              back
            </Button>
          </LinkContainer>
          <Row className="mt-2 pb-2 border-bottom">
            <Col md="auto">
              <Button
                variant="light"
                className="mr-3"
                onClick={() => undefined}
              >
                <ProgramCover rec={rec} showCheckbox={NO} />
              </Button>
            </Col>
            <Col>
              <Row className="mb-2 pt-5">
                <Col>
                  <Badge className="p-2" variant="dark">
                    {airings.length} episode{airings.length > 1 ? 's' : ''}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    size={'xs' as any}
                    className=" mr-2"
                    variant="outline-secondary"
                    onClick={() => bulkAddAirings(airings.map((a) => a.data))}
                  >
                    <span className="fa fa-plus" /> All Episodes
                  </Button>
                  <Button
                    size={'xs' as any}
                    className="mr-2"
                    variant="outline-secondary"
                    onClick={() => bulkRemAirings(airings.map((a) => a.data))}
                  >
                    <span className="fa fa-minus" /> All Episodes
                  </Button>
                  <div className="text-secondary ml-3 d-inline-block smaller">
                    <span className="fa fa-shopping-cart pr-2" />
                    {selectedCount}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div className="scrollable-area">
          {airings.map((airing) => {
            return (
              <RecordingSlim
                key={airing.object_id}
                airing={airing}
                doDelete={() => undefined}
                withShow={OFF}
                withSelect={ON}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  const airings: StdObj[] = [];
  let selectedCount = 0;
  if (airings.length > 0) {
    selectedCount = state.actionList.records.reduce(
      (a: number, b: StdObj) =>
        a +
        (airings.find((obj: StdObj) => obj.object_id === b.object_id) ? 1 : 0),
      0
    );
  }
  return {
    selectedCount,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(ProgramEpisodeList));
