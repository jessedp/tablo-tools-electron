import { Component } from 'react';

import { connect, ConnectedProps } from 'react-redux';
import { Prompt, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { DiskSpace } from 'check-disk-space';

import { asyncForEach } from 'renderer/utils/utils';
import Airing from '../utils/Airing';
import RecordingExport from './RecordingExport';
import * as ExportListActions from '../store/exportList';
import VideoExport from './VideoExport';
import { ExportRecordType } from '../constants/types';
import { ExportLogRecordType, EXP_WORKING, StdObj } from '../constants/app';
import { ExportRecord } from '../utils/factories';

import routes from '../constants/routes.json';

import DiskInfo from './DiskInfo';

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
  allDiskStats: Record<string, number>;
};

class VideoExportPage extends Component<Props, State> {
  // props: Props;

  constructor(props: Props) {
    super(props);

    this.state = {
      loaded: false,
      allDiskStats: {},
    };
  }

  async componentDidMount() {
    const { actionList, exportList, addExportRecord, remExportRecord } =
      this.props;
    const allDisks: any = {};
    // Since we aren't clearing the ExportList when the page exits, make sure nothing was removed
    // from the actionList while we were gone
    await asyncForEach(exportList, async (rec: ExportRecordType) => {
      const test = actionList.find((airRec: StdObj) => {
        return airRec.object_id === rec.airing.object_id;
      });
      if (!test) {
        remExportRecord(rec);
      }
    });

    await asyncForEach(actionList, async (rec: StdObj) => {
      const airing = new Airing(rec);

      const diskStats: DiskSpace = await window.fs.checkDiskSpace(
        airing.exportFile
      );

      const pathKey = diskStats.diskPath;
      allDisks[pathKey] = allDisks[pathKey]
        ? allDisks[pathKey] + rec.video_details.size
        : rec.video_details.size;
      const newRec = ExportRecord(rec);
      addExportRecord(newRec);
    });
    this.setState({
      loaded: true,
      allDiskStats: allDisks,
    });
  }

  // componentWillUnmount() {
  //   const { bulkRemExportRecord } = this.props;
  //   bulkRemExportRecord();
  // }

  render() {
    const { allDiskStats, loaded } = this.state;
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
        <div className="mt-2 mb-2 ml-5">
          {Object.keys(allDiskStats).map((path) => {
            return (
              <div>
                <DiskInfo
                  key={path}
                  displayPath
                  filename={path}
                  videoSize={allDiskStats[path]}
                />
              </div>
            );
          })}
        </div>

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
    exportList: exportList.records.filter(
      (rec: ExportRecordType) => rec.isBulk
    ),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ExportListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(VideoExport(VideoExportPage));
