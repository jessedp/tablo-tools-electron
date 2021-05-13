import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import * as ExportListActions from '../actions/exportList';

import TitleSlim from './TitleSlim';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import { NamingTemplateType } from '../constants/app';
import { ExportRecordType } from '../reducers/types';
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
  updateExportRecord: (arg0: ExportRecordType) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

type State = Record<string, never>;

class RecordingExport extends Component<Props, State> {
  componentDidUpdate(prevProps: Props) {
    const { record } = this.props;

    if (prevProps.record !== record) {
      this.render();
    }
  }

  updateTemplate = (template: NamingTemplateType) => {
    const { record, updateExportRecord } = this.props;
    record.airing.template = template;
    updateExportRecord(record);
  };

  render() {
    const { record, actionOnDuplicate } = this.props;
    const { exportInc, exportLabel, duration, log } = record.progress;
    const { airing, state: exportState } = record;
    const classes = `border pb-1 mb-2 pt-1`;
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
              <Col md="auto">
                <FileInfo
                  airing={airing}
                  actionOnDuplicate={actionOnDuplicate}
                  exportState={exportState}
                  updateTemplate={this.updateTemplate}
                />
              </Col>
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
  const record = exportList.exportList.find(
    (rec: ExportRecordType) => rec.airing.object_id === airing.object_id
  );
  return {
    record,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ ...ExportListActions }, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(RecordingExport);
