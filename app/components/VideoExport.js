// @flow
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Airing, { ensureAiringArray } from '../utils/Airing';
import RecordingExport from './RecordingExport';
import { throttleActions } from '../utils/utils';

type Props = {
  airingList: Array<Airing>,
  label?: string
};
type State = { opened: boolean, exportState: number };

const EXP_WAITING = 1;
const EXP_WORKING = 2;
const EXP_DONE = 3;

export default class VideoExport extends Component<Props, State> {
  props: Props;

  static defaultProps: {};

  freezeAirings: boolean;

  // TODO: ref type again
  airingRefs: {};

  constructor(props: Props) {
    super();
    this.state = {
      opened: false,
      exportState: EXP_WAITING
    };

    this.airingRefs = {};
    this.freezeAirings = false;
    const { airingList } = props;

    airingList.forEach(item => {
      this.airingRefs[item.object_id] = React.createRef();
    });

    (this: any).toggle = this.toggle.bind(this);
    (this: any).show = this.show.bind(this);
    (this: any).processVideo = this.processVideo.bind(this);
    (this: any).cancelProcess = this.cancelProcess.bind(this);
    (this: any).close = this.close.bind(this);
  }

  componentWillUnmount() {
    this.cancelProcess();
  }

  processVideo = async () => {
    const { exportState } = this.state;
    if (exportState === EXP_DONE) return;

    await this.setState({ exportState: EXP_WORKING });

    const actions = [];

    Object.keys(this.airingRefs)
      .sort((a, b) => (a < b ? -1 : 1))
      .forEach(id => {
        actions.push(() => this.airingRefs[id].current.processVideo());
      });

    // console.log('videoExport start', actions.length, new Date());
    await throttleActions(actions, 1).then(results => {
      // console.log(results);
      return results;
    });

    // console.log(logs);
    // console.log('videoExport done', new Date());

    this.freezeAirings = true;

    await this.setState({ exportState: EXP_DONE });
  };

  cancelProcess = async () => {
    Object.keys(this.airingRefs).forEach(id => {
      if (this.airingRefs[id].current)
        this.airingRefs[id].current.cancelProcess();
    });
    this.setState({ exportState: EXP_WAITING });
  };

  close = async () => {
    this.cancelProcess();
    this.setState({
      opened: false
    });
  };

  show() {
    this.setState({
      opened: true
    });
  }

  toggle() {
    const { opened } = this.state;
    this.setState({
      opened: !opened
    });
  }

  render() {
    let { airingList, label } = this.props;

    const { opened, exportState } = this.state;

    let size = 'xs';
    if (label) {
      label = <span className="pl-1">{label}</span>;
      size = 'sm';
    }

    airingList = ensureAiringArray(airingList);
    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    airingList.sort((a, b) => timeSort(a, b));

    return (
      <>
        <Button
          variant="outline-secondary"
          size={size}
          onClick={this.show}
          title="Export Video"
        >
          <span className="fa fa-download" />
          {label}
        </Button>

        <Modal
          size="xl"
          show={opened}
          onHide={this.cancelProcess}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Exporting:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {airingList.map(airing => {
              const ref = this.airingRefs[airing.object_id];
              return (
                <RecordingExport
                  ref={ref}
                  airing={airing}
                  key={Math.floor(Math.random() * 1000000)}
                  freeze={this.freezeAirings}
                />
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <ExportButton
              state={exportState}
              cancel={this.cancelProcess}
              process={this.processVideo}
              close={this.close}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
VideoExport.defaultProps = { label: '' };

/**
 * @return {string}
 */
function ExportButton(prop) {
  const { state, cancel, close, process } = prop;

  if (state === EXP_WORKING) {
    return (
      <Button variant="secondary" onClick={cancel}>
        Cancel
      </Button>
    );
  }

  if (state === EXP_DONE) {
    return (
      <Button variant="secondary" onClick={close}>
        Close
      </Button>
    );
  }

  // if state === EXP_WAITING
  return (
    <>
      <Button variant="primary" onClick={process}>
        Export
      </Button>
      <Button variant="secondary" onClick={close}>
        Close
      </Button>
    </>
  );
}
