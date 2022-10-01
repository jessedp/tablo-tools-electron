import { Component } from 'react';

import { connect, ConnectedProps } from 'react-redux';
import { Prompt, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { Alert } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { DiskSpace } from 'check-disk-space';
import { asyncForEach } from 'renderer/utils/utils';
import Airing from '../utils/Airing';
import RecordingExport from './RecordingExport';
import * as ExportListActions from '../store/exportList';
import VideoExport from './VideoExport';
import { ExportRecordType } from '../constants/types';
import {
  EXP_WORKING,
  DUPE_SKIP,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_ADDID,
  StdObj,
} from '../constants/app';
import { ExportRecord } from '../utils/factories';
import Checkbox from './Checkbox';
import routes from '../constants/routes.json';
import DiskInfo from './DiskInfo';

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

/**
 * @return {string}
 */

function ExportActions(prop: Record<string, any>) {
  const {
    state,
    cancel,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggleDOF,
    actionOnDuplicate,
    setActionOnDuplicate,
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Alert variant="primary" className="p-2 m-2">
        <Row>
          <Col md="5" />
          <Col md="2">
            <Button variant="warning" onClick={cancel}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Alert>
    );
  }

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Alert variant="primary" className="p-2 m-2">
      <Row>
        <Col md="4" className="pt-2">
          <h4 className="pl-2">Export Recordings</h4>
        </Col>
        <Col md="auto">
          <InputGroup size="sm" className="pt-1">
            <InputGroup.Prepend>
              <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
                <span className="fa fa-info pr-2" />
                Max:
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              as="select"
              value={atOnce}
              aria-describedby="btnState"
              onChange={atOnceChange}
              title="More than 2 is probably silly, but YOLO!"
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </Form.Control>
          </InputGroup>
        </Col>
        <Col md="auto">
          <Button variant="light" onClick={process} className="mr-2">
            Export
          </Button>
        </Col>
        <Col md="auto" className="pt-2">
          <Checkbox
            checked={deleteOnFinish}
            handleChange={toggleDOF}
            label="Delete when finished?"
          />
        </Col>
        <Col md="auto">
          <InputGroup size="sm" className="pt-1">
            <InputGroup.Prepend>
              <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
                <span className="fa fa-info pr-2" />
                On duplicate:
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              as="select"
              value={actionOnDuplicate}
              aria-describedby="btnState"
              onChange={setActionOnDuplicate}
              title="Override the global duplicte setting"
            >
              <option value={DUPE_INC}>{DUPE_INC.toLowerCase()}</option>
              <option value={DUPE_OVERWRITE}>
                {DUPE_OVERWRITE.toLowerCase()}
              </option>
              <option value={DUPE_ADDID}>add id</option>
              <option value={DUPE_SKIP}>{DUPE_SKIP.toLowerCase()}</option>
            </Form.Control>
          </InputGroup>
        </Col>{' '}
      </Row>
    </Alert>
  );
}
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
    const { actionList, addExportRecord } = this.props;
    const allDisks: any = {};
    await asyncForEach(actionList, async (rec: StdObj) => {
      console.log(rec);
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
    console.log(allDisks);
    this.setState({
      loaded: true,
      allDiskStats: allDisks,
    });
  }

  componentWillUnmount() {
    const { bulkRemExportRecord } = this.props;
    bulkRemExportRecord();
  }

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
    exportList: exportList.records,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ExportListActions, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(VideoExport(VideoExportPage));
