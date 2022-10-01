import { Component } from 'react';

import { connect, ConnectedProps } from 'react-redux';
import { Prompt, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Airing from '../utils/Airing';
import RecordingExport from './RecordingExport';
import * as ExportListActions from '../store/exportList';
import VideoExport from './VideoExport';
import { ExportRecordType } from '../constants/types';
import { EXP_WORKING, StdObj } from '../constants/app';
import { ExportRecord } from '../utils/factories';

import routes from '../constants/routes.json';
import ExportActions from './ExportActions';

interface Props extends PropsFromRedux {
  exportState: number;
  atOnce: number;
  atOnceChange: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  actionOnDuplicate: string;
  setActionOnDuplicate: (action: string) => void;
  deleteOnFinished: number;
  toggleDOF: () => void;
  cancelProcess: () => void;
  processVideo: () => void;
}
type State = {
  loaded: boolean;
};

class VideoExportPage extends Component<Props, State> {
  // props: Props;

  constructor(props: Props) {
    super(props);
    // this.props = props;
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    const { actionList, addExportRecord } = this.props;
    actionList.forEach((rec: StdObj) => {
      const newRec = ExportRecord(rec);
      addExportRecord(newRec);
    });
    this.setState({
      loaded: true,
    });
  }

  componentWillUnmount() {
    const { bulkRemExportRecord } = this.props;
    bulkRemExportRecord();
  }

  render() {
    const { loaded } = this.state;
    const {
      exportList,
      exportState,
      atOnce,
      atOnceChange,
      deleteOnFinished,
      toggleDOF,
      actionOnDuplicate,
      setActionOnDuplicate,
      cancelProcess,
      processVideo,
    } = this.props;
    if (!loaded) return <></>; //

    if (exportList.length === 0) {
      return <Redirect to={routes.SEARCH} />;
    }

    const sortedExportList = [...exportList].sort(
      (a: ExportRecordType, b: ExportRecordType) => {
        if (a.airing.airing_details.datetime < b.airing.airing_details.datetime)
          return 1;
        return -1;
      }
    );

    return (
      <>
        <Prompt
          when={exportState === EXP_WORKING}
          message="Leaving will CANCEL all Exports in progress. Are you sure?"
        />
        <ExportActions
          state={exportState}
          atOnce={atOnce}
          atOnceChange={atOnceChange}
          cancel={cancelProcess}
          process={processVideo}
          toggleDOF={toggleDOF}
          deleteOnFinish={deleteOnFinished}
          actionOnDuplicate={actionOnDuplicate}
          setActionOnDuplicate={setActionOnDuplicate}
        />
        {sortedExportList.map((rec: ExportRecordType) => {
          return (
            <RecordingExport
              airing={new Airing(rec.airing)}
              key={`RecordingExport-${rec.airing.object_id}`}
              actionOnDuplicate={actionOnDuplicate}
            />
          );
        })}
      </> //
    );
  }
}

const mapStateToProps = (state: any) => {
  const { exportList } = state;
  return {
    actionList: state.actionList.records,
    exportList: exportList.records,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ExportListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(VideoExport(VideoExportPage));
