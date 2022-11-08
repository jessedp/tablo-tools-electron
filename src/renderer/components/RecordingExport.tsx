import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import * as ActionListActions from '../store/actionList';
import * as ExportListActions from '../store/exportList';

import TitleSlim from './TitleSlim';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import { EXP_WORKING, EXP_DONE } from '../constants/app';
import { NamingTemplateType, ExportRecordType } from '../constants/types';
import ExportProgress from './ExportProgress';
import FileInfo from './FileInfo';

type OwnProps = {
  airing: Airing;
  actionOnDuplicate: string;
};

type StateProps = {
  record: ExportRecordType;
};

type DispatchProps = {
  remAiring: (arg0: StdObj) => void;
  remExportRecord: (arg0: ExportRecordType) => void;
  updateExportRecord: (arg0: ExportRecordType) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

type State = {
  airing: Airing | undefined;
};

class RecordingExport extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      airing: undefined,
    };
  }

  async componentDidMount() {
    const { record } = this.props;
    const { airing } = record;
    this.setState({ airing: await Airing.create(airing) });
  }

  componentDidUpdate(prevProps: Props) {
    const { record } = this.props;

    if (prevProps.record !== record) {
      this.render();
    }
  }

  removeFromExport = () => {
    const { record, remAiring, remExportRecord } = this.props;
    remAiring(record.airing);
    remExportRecord(record);
  };

  updateTemplate = (template: NamingTemplateType) => {
    const { record, updateExportRecord } = this.props;
    const { airing } = this.state;

    const updateRec = JSON.parse(JSON.stringify(record));

    updateRec.airing.template = template;

    if (airing) {
      airing.template = template;
      this.setState({ airing });
    }
    updateExportRecord(updateRec);
  };

  render() {
    const { record, actionOnDuplicate } = this.props;
    const { exportInc, exportLabel, duration, log } = record.progress;
    const { airing } = this.state;
    const { state: exportState } = record;
    const classes = `border pb-1 mb-2 pt-1`;

    if (!airing) return <></>;

    return (
      <Container className={classes}>
        <Row>
          <Col md="1">
            <TabloImage
              imageId={airing.show.thumbnail}
              className="menu-image-lg"
            />
          </Col>
          <Col md="11">
            <Row>
              <Col md="6">
                <TitleSlim airing={airing} withShow={1} />
              </Col>
              <Col md="6">
                <ExportProgress
                  label={exportLabel}
                  state={exportState}
                  inc={exportInc}
                  ffmpegLog={log}
                  time={duration}
                />
              </Col>
            </Row>
            <Row>
              <Col md="11">
                <FileInfo
                  airing={airing}
                  actionOnDuplicate={actionOnDuplicate}
                  exportState={exportState}
                  updateTemplate={this.updateTemplate}
                />
              </Col>
              {exportState !== EXP_WORKING && exportState !== EXP_DONE ? (
                <Col md="1">
                  <Button
                    variant="outline-danger"
                    size={'xs' as any}
                    title="Remove from queue"
                    onClick={this.removeFromExport}
                  >
                    <span className="fa fa-trash-alt" />
                  </Button>
                </Col>
              ) : (
                ''
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = (state: any, ownProps: OwnProps) => {
  const { exportList } = state;
  const { airing } = ownProps;
  const record = exportList.records.find(
    (rec: ExportRecordType) => rec.airing.object_id === airing.object_id
  );
  return {
    record,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { ...ExportListActions, ...ActionListActions },
    dispatch
  );
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(RecordingExport);
