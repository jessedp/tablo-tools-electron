// @flow
import React, { Component } from 'react';

import ExportRecordType from '../reducers/types';

import {
  EXP_WAITING,
  EXP_WORKING,
  EXP_DONE,
  EXP_CANCEL,
  EXP_FAIL
} from '../constants/app';

import {
  throttleActions,
  timeStrToSeconds,
  readableDuration
} from '../utils/utils';
import Airing from '../utils/Airing';
import { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';

type Props = {
  airingList: Array<Airing>,
  exportList: Array<ExportRecordType>,

  addExportRecord: (record: ExportRecordType) => void,
  updateExportRecord: (record: ExportRecordType) => void,
  bulkRemExportRecord: (Array<ExportRecordType>) => void
};

type State = { exportState: number, atOnce: number, deleteOnFinish: number };

const VideoExport = (WrappedComponent: any) => {
  // $FlowFixMe wtf typing
  return class extends Component<Props, State> {
    props: Props;

    static defaultProps: {};

    shouldCancel: boolean;

    timings: Object;

    constructor() {
      super();
      this.state = {
        exportState: EXP_WAITING,
        atOnce: 1,
        deleteOnFinish: CHECKBOX_OFF
      };

      this.shouldCancel = false;
      this.timings = {};

      (this: any).processVideo = this.processVideo.bind(this);
      (this: any).cancelProcess = this.cancelProcess.bind(this);
    }

    componentWillUnmount() {
      this.cancelProcess(false);
    }

    atOnceChange = async (event: SyntheticEvent<HTMLInputElement>) => {
      await this.setState({ atOnce: parseInt(event.currentTarget.value, 10) });
    };

    processVideo = async () => {
      const { exportList } = this.props;
      const { exportState, atOnce } = this.state;

      global.EXPORTING = true;

      if (exportState === EXP_DONE) return;
      await this.setState({ exportState: EXP_WORKING });

      const actions = [];

      exportList.forEach(rec => {
        actions.push(() => {
          if (this.shouldCancel === false)
            return rec.airing.processVideo(this.updateProgress);
        });
      });

      await throttleActions(actions, atOnce).then(results => {
        return results;
      });

      if (this.shouldCancel) {
        this.setState({ exportState: EXP_CANCEL });
      } else {
        this.setState({ exportState: EXP_DONE });
      }
      global.EXPORTING = false;
    };

    updateProgress = (airingId: number, progress: Object) => {
      const { deleteOnFinish } = this.state;
      const { exportList, updateExportRecord } = this.props;
      const record: ExportRecordType = exportList.find(
        rec => rec.airing.object_id === airingId
      );
      if (!record || record.state === EXP_DONE) return;

      const { airing } = record;

      if (!this.timings[airing.id]) {
        this.timings[airing.id] = { start: Date.now(), duration: 0 };
      }
      const timing = this.timings[airing.id];

      if (progress.finished) {
        if (deleteOnFinish === CHECKBOX_ON) {
          airing.delete();
        }
        record.state = EXP_DONE;
        record.progress = {
          exportInc: 1000,
          exportLabel: 'Complete',
          log: progress.log
        };
      } else if (progress.cancelled) {
        record.state = EXP_CANCEL;
        record.progress = {
          exportInc: 0,
          exportLabel: 'Cancelled'
        };
      } else if (progress.failed) {
        record.state = EXP_FAIL;
        record.progress = {
          exportInc: 0,
          exportLabel: 'Failed'
        };
      } else {
        // const pct = progress.percent  doesn't always work, so..
        const pct = Math.round(
          (timeStrToSeconds(progress.timemark) /
            parseInt(airing.videoDetails.duration, 10)) *
            100
        );

        const label = `${progress.timemark} / ${readableDuration(
          airing.videoDetails.duration
        )}`;

        record.state = EXP_WORKING;
        record.progress = {
          exportInc: pct,
          exportLabel: label
        };
      }

      timing.duration = Date.now() - timing.start;
      record.progress = { ...record.progress, ...timing };
      this.timings[airing.id] = timing;

      updateExportRecord(record);
    };

    cancelProcess = async (updateState: boolean = true) => {
      const { exportList } = this.props;

      this.shouldCancel = true;

      if (exportList) {
        exportList.forEach(rec => {
          if (rec.state === EXP_WORKING) {
            rec.airing.cancelVideoProcess();
          }
        });
      }

      if (updateState) this.setState({ exportState: EXP_CANCEL });
    };

    toggleDOF = () => {
      const { deleteOnFinish } = this.state;
      this.setState({
        deleteOnFinish:
          deleteOnFinish === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF
      });
    };

    render() {
      const { exportState, deleteOnFinish, atOnce } = this.state;
      /* eslint-disable react/jsx-props-no-spreading */
      // $FlowFixMe
      return (
        <WrappedComponent
          {...this.props}
          exportState={exportState}
          deleteOnFinish={deleteOnFinish}
          atOnce={atOnce}
          atOnceChange={this.atOnceChange}
          processVideo={this.processVideo}
          cancelProcess={this.cancelProcess}
          toggleDOF={this.toggleDOF}
        />
      );
    }
  };
};

export default VideoExport;
