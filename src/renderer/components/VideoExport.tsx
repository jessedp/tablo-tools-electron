import { Component } from 'react';
import { ExportRecordType, ExportLogRecordType } from '../constants/types';
import {
  EXP_WAITING,
  EXP_WORKING,
  EXP_DONE,
  EXP_CANCEL,
  EXP_FAIL,
} from '../constants/app';
import {
  throttleActions,
  timeStrToSeconds,
  readableDuration,
  asyncForEach,
} from '../utils/utils';
import Airing from '../utils/Airing';
import { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import getConfig from '../utils/config';
import { ExportLogRecord } from '../utils/factories';

const debug = require('debug')('tablo-tools:VideoExport-tsx');

type Props = {
  airing: Airing;
  // airingList: Array<Airing>;
  exportList: Array<ExportRecordType>;
  // addExportRecord: (record: ExportRecordType) => void;
  updateExportRecord: (record: ExportRecordType) => void;
  // bulkRemExportRecord: (arg0: Array<ExportRecordType>) => void;
};
type State = {
  exportState: number;
  atOnce: number;
  deleteOnFinish: number;
  actionOnDuplicate: string;
};

const VideoExport = (WrappedComponent: any) => {
  return class WrappedVideoExportComp extends Component<Props, State> {
    shouldCancel: boolean;

    logRecord: ExportLogRecordType | undefined;

    timings: Record<string, any>;

    constructor(props: Props) {
      super(props);
      this.state = {
        exportState: EXP_WAITING,
        atOnce: 1,
        deleteOnFinish: CHECKBOX_OFF,
        actionOnDuplicate: getConfig().actionOnDuplicate,
      };
      this.shouldCancel = false;
      this.timings = {};
      // this.logRecord = ExportLogRecord();
      (this as any).processVideo = this.processVideo.bind(this);
      (this as any).cancelProcess = this.cancelProcess.bind(this);
    }

    componentWillUnmount() {
      const { exportState } = this.state;
      if (exportState === EXP_WORKING) {
        this.cancelProcess(false);
      }
    }

    atOnceChange = async (event: React.SyntheticEvent<HTMLInputElement>) => {
      this.setState({
        atOnce: parseInt(event.currentTarget.value, 10),
      });
    };

    processVideo = async () => {
      const { exportList, updateExportRecord } = this.props;
      const { atOnce, actionOnDuplicate } = this.state;
      global.EXPORTING = true;
      this.shouldCancel = false;

      console.log('RESET EXPORT RECS...');
      await asyncForEach(exportList, async (rec: ExportRecordType) => {
        console.log(rec);
        const newRec = { ...rec, ...{ state: EXP_WAITING } };
        updateExportRecord(newRec);
      });

      this.setState({
        exportState: EXP_WORKING,
      });

      // TODO: any to function def
      const actions: Array<any> = [];
      await asyncForEach(exportList, async (rec: ExportRecordType) => {
        const airing = new Airing(rec.airing);
        actions.push(() => {
          const channel = `export-progress-${airing.object_id}`;
          if (!this.shouldCancel) {
            window.ipcRenderer.on(channel, (message: any) => {
              this.updateProgress(airing.object_id, message);
            });
            return window.Airing.exportVideo(
              airing.object_id,
              actionOnDuplicate,
              airing.template
            );
          }
          return new Promise((resolve) => {
            resolve(`Canceled ${airing.object_id}`);
          });
        });
      });
      console.log('VideoExport - async actions - ', actions);
      await throttleActions(actions, atOnce).then((results) => {
        return results;
      });

      if (this.shouldCancel) {
        this.setState({
          exportState: EXP_CANCEL,
        });
      } else {
        debug('processVideo - set state DONE');
        console.log('processVideo - set state DONE');
        this.setState({
          exportState: EXP_DONE,
        });
      }

      global.EXPORTING = false;
    };

    updateProgress = async (
      airingId: number,
      progress: Record<string, any>
    ) => {
      const { atOnce, deleteOnFinish, actionOnDuplicate } = this.state;
      const { exportList, updateExportRecord } = this.props;
      let record: ExportRecordType | undefined = exportList.find(
        (rec) => rec.airing.object_id === airingId
      );
      if (!record || record.state === EXP_DONE) return;
      record = { ...{}, ...record };
      const { airing: stdAiring } = record;
      const airing = new Airing(stdAiring);

      if (!this.logRecord) {
        this.logRecord = ExportLogRecord(airing);
        this.logRecord.deleteOnFinish = Boolean(deleteOnFinish);
        this.logRecord.atOnce = atOnce;
        this.logRecord.dupeAction = actionOnDuplicate;
      }

      if (!this.timings[airing.id]) {
        this.timings[airing.id] = {
          start: Date.now(),
          duration: 0,
        };
      }

      const timing = this.timings[airing.id];
      let dumpLog = false;

      if (progress.finished) {
        if (deleteOnFinish === CHECKBOX_ON) {
          const status = airing.isExportValid();

          if (status.valid) {
            await airing.delete();
          }
        }

        record.state = EXP_DONE;
        record.progress = {
          exportInc: 1000,
          exportLabel: 'Complete',
          log: progress.log,
        };
        this.logRecord.status = EXP_DONE;
        dumpLog = true;
      } else if (progress.cancelled) {
        record.state = EXP_CANCEL;
        record.progress = {
          exportInc: 0,
          exportLabel: 'Cancelled',
        };
        this.logRecord.status = EXP_CANCEL;
        dumpLog = true;
      } else if (progress.failed) {
        record.state = EXP_FAIL;
        record.progress = {
          exportInc: 0,
          exportLabel: 'Failed',
          log: progress.failedMsg.toString(),
        };
        this.logRecord.status = EXP_FAIL;
        dumpLog = true;
      } else {
        // const pct = progress.percent  doesn't always work, so..
        let pct = Math.round(
          (timeStrToSeconds(progress.timemark) /
            parseInt(airing.videoDetails.duration, 10)) *
            100
        );
        if (pct === 0) pct = 0.1;

        const label = `${progress.timemark} / ${readableDuration(
          airing.videoDetails.duration
        )}`;
        record.state = EXP_WORKING;
        record.progress = {
          exportInc: pct,
          exportLabel: label,
        };
      }

      if (dumpLog) {
        this.logRecord.ffmpegLog = progress.log;
        // FIXME : ExportLogRecord types
        // this.logRecord.endTime = new Date().toLocaleString();
        this.logRecord.endTime = new Date();
        window.db.insertAsync('ExportLogDb', this.logRecord);
        // this.logRecord = {};
      }

      timing.duration = Date.now() - timing.start;
      record.progress = { ...record.progress, ...timing };
      this.timings[airing.id] = timing;
      updateExportRecord(record);
    };

    cancelProcess = async (updateState = true) => {
      const { exportList } = this.props;
      this.shouldCancel = true;
      if (exportList) {
        exportList.forEach((rec) => {
          console.log('cancelProcess - rec - state: ', rec.state, '\n', rec);
          // Cancelling will delete existing files - need to be careful in case someone
          // is re-exporting, something happens, and cancel is clicked => existing files will be preserved
          if (rec.state === EXP_WORKING || rec.state === EXP_CANCEL) {
            console.log('Cancelling...');
            window.Airing.cancelExportVideo(rec.airing);
          } else {
            console.log('Skipping...');
          }
        });
      }

      if (updateState)
        this.setState({
          exportState: EXP_CANCEL,
        });
    };

    toggleDOF = () => {
      const { deleteOnFinish } = this.state;
      this.setState({
        deleteOnFinish:
          deleteOnFinish === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF,
      });
    };

    setActionOnDuplicate = (event: React.SyntheticEvent<HTMLInputElement>) => {
      this.setState({
        actionOnDuplicate: event.currentTarget.value,
      });
    };

    render() {
      const { exportState, actionOnDuplicate, deleteOnFinish, atOnce } =
        this.state;

      /* eslint-disable react/jsx-props-no-spreading */
      return (
        <WrappedComponent
          {...this.props}
          exportState={exportState}
          actionOnDuplicate={actionOnDuplicate}
          setActionOnDuplicate={this.setActionOnDuplicate}
          deleteOnFinish={deleteOnFinish}
          toggleDOF={this.toggleDOF}
          atOnce={atOnce}
          atOnceChange={this.atOnceChange}
          processVideo={this.processVideo}
          cancelProcess={this.cancelProcess}
        />
      );
    }
  };
};

export default VideoExport;
