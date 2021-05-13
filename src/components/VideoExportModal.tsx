import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import fs from 'fs';
import PubSub from 'pubsub-js';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { format } from 'date-fns';
import VideoExport from './VideoExport';
import { ExportRecordType } from '../reducers/types';
import * as ExportListActions from '../actions/exportList';
import * as ActionListActions from '../actions/actionList';
import { EXP_WORKING } from '../constants/app';
import RecordingExport from './RecordingExport';
import Airing from '../utils/Airing';
import { ExportRecord } from '../utils/factories';
import Checkbox, { CHECKBOX_ON } from './Checkbox';
import Button from './ButtonExtended';
import Modal from './ModalExtended';
import getConfig from '../utils/config';

interface Props extends PropsFromRedux {
  //   history: any;
  // }

  // // import getConfig from '../utils/config';
  // type OwnProps = {
  airing: Airing;
  label?: string; // FIXME: input or type
  exportState: number;
  toggleDOF: () => void;
  deleteOnFinish: number;
  atOnce: number;
  atOnceChange: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  cancelProcess: () => void;
  processVideo: () => void;
}

// type StateProps = {
//   exportList: Array<ExportRecordType>;
// };

// type DispatchProps = {
//   addExportRecord: (record: ExportRecordType) => void;
//   bulkRemExportRecord: (arg0: Array<ExportRecordType>) => void;
//   remAiring: (arg0: Airing) => void;
// };

// type Props = OwnProps & StateProps & DispatchProps;

type State = {
  opened: boolean;
};

class VideoExportModal extends Component<Props, State> {
  static defaultProps: Record<string, any>;

  constructor(props: Props) {
    super(props);
    // this.props = props;
    this.state = {
      opened: false,
    };
    (this as any).show = this.show.bind(this);
    (this as any).close = this.close.bind(this);
  }

  close = async () => {
    const {
      exportList,
      deleteOnFinish,
      remAiring,
      bulkRemExportRecord,
    } = this.props;
    bulkRemExportRecord([]);

    if (deleteOnFinish === CHECKBOX_ON) {
      remAiring(exportList[0].airing);
      PubSub.publish('DB_CHANGE', '');
    }

    this.setState({
      opened: false,
    });
  };

  show() {
    const { airing, bulkRemExportRecord, addExportRecord } = this.props;
    bulkRemExportRecord([]);
    addExportRecord(ExportRecord(airing));
    this.setState({
      opened: true,
    });
  }

  render() {
    const {
      airing,
      exportList,
      exportState,
      atOnce,
      atOnceChange,
      deleteOnFinish,
      toggleDOF,
      cancelProcess,
      processVideo,
    } = this.props;
    const { label } = this.props;
    const { opened } = this.state;
    let size = 'xs';
    let prettyLabel = <></>;

    if (label) {
      prettyLabel = <span className="pl-1">{label}</span>;
      size = 'sm';
    }

    if (!exportList) {
      console.log('missing exportList!');
      return <></>; //
    }

    const airingList = exportList.map((rec: ExportRecordType) => rec.airing);
    let variant = 'outline-secondary';
    let title = 'Export Video';

    if (fs.existsSync(airing.exportFile)) {
      const stats = fs.statSync(airing.exportFile);
      const ctime = format(new Date(stats.ctime), 'ccc M/d/yy @ h:mm:ss a');
      variant = 'outline-warning';
      title = `Previously Exported ${ctime}`;
    }

    return (
      <>
        <Button variant={variant} size={size} onClick={this.show} title={title}>
          <span className="fa fa-download" />
          {prettyLabel}
        </Button>
        <Modal
          size="1000"
          show={opened}
          onHide={this.close}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Export</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {airingList.map((expAiring: Airing) => {
              return (
                <RecordingExport
                  airing={expAiring}
                  actionOnDuplicate={getConfig().actionOnDuplicate}
                  key={`RecordingExport-${expAiring.object_id}`}
                />
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <ExportButton
              state={exportState}
              deleteOnFinish={deleteOnFinish}
              toggleDOF={toggleDOF}
              atOnce={atOnce}
              atOnceChange={atOnceChange}
              cancel={cancelProcess}
              process={processVideo}
              close={this.close}
            />
          </Modal.Footer>
        </Modal>
      </> //
    );
  }
}

VideoExportModal.defaultProps = {
  label: '',
};

/**
 * @return {string}
 */
function ExportButton(prop: any) {
  const {
    state,
    cancel,
    close,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggleDOF,
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Button variant="secondary" onClick={cancel}>
        Cancel
      </Button>
    );
  }

  // if (state === EXP_DONE) {
  //   return (
  //     <Button variant="secondary" onClick={close}>
  //       Close
  //     </Button>
  //   );
  // }
  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Row>
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
        <Button variant="primary" onClick={process} className="mr-2">
          Export
        </Button>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Col>
    </Row>
  );
}

const mapStateToProps = (state: any) => {
  const { exportList } = state;
  return {
    exportList: exportList.exportList,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { ...ExportListActions, ...ActionListActions },
    dispatch
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(VideoExport(VideoExportModal));

// export default connect<StateProps, DispatchProps, OwnProps>(
//   mapStateToProps,
//   mapDispatchToProps
// )(VideoExport(VideoExportModal));
