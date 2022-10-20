import { Component } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

import { asyncForEach } from '../utils/utils';
import Recording from './Recording';
import Airing, { ensureAiringArray } from '../utils/Airing';
import type { SearchAlert } from '../constants/types';
import type { SearchSliceState } from '../store/search';
import SearchResultAlerts from './SearchResultAlerts';
import RecordingSlim from './RecordingSlim';
import { ON, VIEW_GRID } from '../constants/app';

type OwnProps = Record<string, never>;
type StateProps = SearchSliceState;

type DispatchProps = Record<string, never>;

type SearchResultsProps = OwnProps & StateProps & DispatchProps;

type State = {
  searchAlert: SearchAlert;
  airingList: Airing[];
  view?: string;
  loading: boolean;
};

function Loading(prop: any) {
  const { loading } = prop;
  if (!loading) return <></>; //

  return (
    <div
      className="d-flex justify-content-center"
      style={{
        maxWidth: '400px',
        marginTop: '75px',
      }}
    >
      <Spinner animation="border" size={'xl' as any} variant="primary" />
    </div>
  );
}

class SearchResults extends Component<SearchResultsProps, State> {
  initialState: State;

  constructor(props: SearchResultsProps) {
    super(props);
    this.initialState = {
      loading: true,
      airingList: [],
      view: VIEW_GRID,
      searchAlert: {
        type: '',
        text: '',
        matches: [],
      },
    };
    this.state = this.initialState; // this.delete = this.delete.bind(this);
  }

  async componentDidMount() {
    this.reload();
  }

  componentDidUpdate(prevProps: SearchResultsProps) {
    const { results, searchAlert, loading, view } = this.props;

    if (prevProps.results !== results) {
      this.reload();
    } else if (
      prevProps.searchAlert !== searchAlert ||
      prevProps.loading !== loading ||
      prevProps.view !== view
    ) {
      this.refresh();
    }
  }

  reload = async () => {
    const { results, searchAlert, loading, view } = this.props;
    const airingList: Airing[] = [];

    await asyncForEach(results, async (rec) => {
      const airing = await Airing.create(rec);
      airingList.push(airing);
    });

    this.setState({
      airingList,
      searchAlert,
      loading,
      view,
    });
  };

  refresh = () => {
    const { searchAlert, loading, view } = this.props;
    this.setState({
      searchAlert,
      loading,
      view,
    });
  };

  render() {
    const { searchAlert, loading, view } = this.state;
    let { airingList } = this.state;
    airingList = ensureAiringArray(airingList);
    let rows: Array<JSX.Element> = [];

    if (loading) return <Loading loading={loading} />;

    rows = airingList.map((airing) => {
      if (view === 'list') {
        return (
          <RecordingSlim
            key={`recording-${airing.object_id}`}
            airing={airing}
            withShow={ON}
            withSelect={ON}
            withActions={ON}
          />
        );
      }

      return (
        <Recording key={`recording-${airing.object_id}`} airing={airing} />
      );
    });

    return (
      <div className="scrollable-area">
        <SearchResultAlerts alert={searchAlert} loading={loading} />
        <Row className="m-1 mb-4">{rows}</Row>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  // console.log('SearchResult', state);
  return {
    loading: state.search.loading,
    view: state.search.view,
    results: state.search.results,
    searchAlert: state.search.searchAlert,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps)(
  SearchResults
);
