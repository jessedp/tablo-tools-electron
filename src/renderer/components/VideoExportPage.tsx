import React, { Component } from 'react';

import { connect, ConnectedProps } from 'react-redux';
import { Prompt, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { DiskSpace } from 'check-disk-space';

import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';

import { asyncForEach, throttleActions } from 'renderer/utils/utils';
import Airing from '../utils/Airing';

import * as ExportListActions from '../store/exportList';
import VideoExport from './VideoExport';
import { ExportRecordType, StdObj } from '../constants/types';
import { EXP_WORKING, EXP_WAITING } from '../constants/app';
import { ExportRecord } from '../utils/factories';

import RecordingExportRenderer from './RecordingExportRenderer';

import routes from '../constants/routes.json';

import DiskInfo from './DiskInfo';

import ExportActions from './ExportActions';
import ExportStatus from './ExportStatus';

/** BEGIN Redux setup */
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
/** END Redux setup */

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
  disksChecked: boolean;
  allDiskStats: Record<string, number>;
};

class VideoExportPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loaded: false,
      disksChecked: false,
      allDiskStats: {},
    };
  }

  async componentDidMount() {
    const action = async () => {
      const { actionList, exportList, bulkAddExportRecords, remExportRecord } =
        this.props;

      const allDisks: any = {};
      // Since we aren't clearing the ExportList when the page exits, make sure nothing was removed
      // from the actionList while we were gone
      // console.time('cdm');
      // console.timeLog('cdm', 'check exp list');
      const existingIds: number[] = [];
      await asyncForEach(exportList, async (rec: ExportRecordType) => {
        const test = actionList.find((airRec: StdObj) => {
          return airRec.object_id === rec.airing.object_id;
        });
        if (!test) {
          remExportRecord(rec);
        } else {
          existingIds.push(rec.airing.object_id);
        }
      });
      // console.timeLog('cdm', 'checked exp list');
      // console.timeLog('cdm', 'rebuild export list');
      const newExportRecs: ExportRecordType[] = [];
      const diskChecks: (() => void)[] = []; // Function[]
      await asyncForEach(actionList, async (rec: StdObj) => {
        console.timeLog('cdm', '.');

        const airing = new Airing(rec);

        // Freeze the current Template when adding to Export List
        airing.data.customTemplate = airing.template;
        diskChecks.push(async () => {
          if (!airing.exportFile.startsWith('\\\\')) {
            const diskStats: DiskSpace = await window.fs.checkDiskSpace(
              airing.exportFile
            );

            const pathKey = diskStats.diskPath;
            allDisks[pathKey] = allDisks[pathKey]
              ? allDisks[pathKey] + rec.video_details.size
              : rec.video_details.size;
          }
        });
        if (!existingIds.includes(rec.object_id)) {
          const newRec = ExportRecord(airing.data);
          newExportRecs.push(newRec);
          // addExportRecord(newRec);
        }
      });
      bulkAddExportRecords(newExportRecs);

      throttleActions(diskChecks, 10)
        .then(() =>
          this.setState({ disksChecked: true, allDiskStats: allDisks })
        )
        .catch((e) => console.log('throttle diskChecks', e));

      // console.timeLog('cdm', 'built export list');
      this.setState({
        loaded: true,
      });
      // console.timeEnd('cdm');
    };
    setTimeout(action, 25);
  }

  render() {
    const { disksChecked, allDiskStats, loaded } = this.state;
    const {
      actionList,
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

    if (!loaded) {
      if (actionList.length < 10) return <></>;
      // console.log('render loading....', actionList.length);
      return (
        <>
          <Alert variant="primary" className="mt-5 mr-2">
            <Row
              className="pt-3 pb-3 justify-content-center"
              style={{ width: '100%' }}
            >
              <Col md={5}>
                <Spinner animation="border" variant="white" />
                <span className=" pl-3" style={{ fontSize: '24px' }}>
                  Building the Export Queue...
                </span>
              </Col>
            </Row>
          </Alert>
        </>
      );
    }
    // console.log('render real....');

    if (exportList.length === 0) {
      return <Redirect to={routes.SEARCH} />;
    }

    const sortRecordingDateTime = (
      a: ExportRecordType,
      b: ExportRecordType
    ) => {
      if (a.airing.airing_details.datetime < b.airing.airing_details.datetime) {
        return 1;
      }
      return -1;
    };
    const sortedExportList = [...exportList].sort(
      (a: ExportRecordType, b: ExportRecordType) => {
        // In progress should always be first...
        if (a.state === EXP_WORKING && b.state !== EXP_WORKING) {
          return -1;
        }
        // If multiple are in progress, fall back on recording time
        if (a.state === EXP_WORKING && b.state === EXP_WORKING) {
          return sortRecordingDateTime(a, b);
        }

        // next, anything we've worked on...
        if (![EXP_WORKING, EXP_WAITING].includes(a.state)) {
          return -1;
        }

        // Waiting are last?...
        if (a.state === EXP_WAITING && b.state !== EXP_WAITING) {
          return -1;
        }

        return sortRecordingDateTime(a, b);
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
        <ExportStatus state={exportState} />
        <div className="mt-2 mb-2 ml-5">
          {disksChecked ? (
            Object.keys(allDiskStats).map((path) => {
              return (
                <div key={path}>
                  <DiskInfo
                    displayPath
                    filename={path}
                    videoSize={allDiskStats[path]}
                  />
                </div>
              );
            })
          ) : (
            <div>
              <Spinner animation="border" size="sm" variant="secondary" />
              <span className=" pl-3" style={{ fontSize: '16px' }}>
                Checking disk space...
              </span>
            </div>
          )}
        </div>
        <div className="ExpList">
          <AutoSizer>
            {({ height, width }) => (
              <List
                itemData={{
                  list: sortedExportList,
                  actionOnDuplicate,
                }}
                className="List"
                height={height}
                itemCount={sortedExportList.length}
                itemSize={120}
                width={width}
                itemKey={(
                  index: number,
                  data: { list: ExportRecordType[]; actionOnDuplicate: string }
                ) => `RecordingExport-${data.list[index].airing.object_id}`}
              >
                {RecordingExportRenderer}
              </List>
            )}
          </AutoSizer>
        </div>
      </> //
    );
  }
}

export default connector(VideoExport(VideoExportPage));
