// @flow
import React, { Component } from 'react';
import os from 'os';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// import InputGroup from 'react-bootstrap/InputGroup';
// import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { Badge } from 'react-bootstrap';
import Airing, { ensureAiringArray } from '../utils/Airing';
import RecordingExport from './RecordingExport';
import { asyncForEach, throttleActions } from '../utils/utils';

type Props = {
  airingList: Array<Airing>,
  label?: string
};
type State = { opened: boolean, exportState: number, atOnce: number };

const EXP_WAITING = 1;
const EXP_WORKING = 2;
const EXP_DONE = 3;
const EXP_CANCEL = 4;

export default class VideoExport extends Component<Props, State> {
  props: Props;

  static defaultProps: {};

  shouldCancel: boolean;

  // TODO: ref type again
  airingRefs: {};

  constructor(props: Props) {
    super();
    this.state = {
      opened: false,
      exportState: EXP_WAITING,
      atOnce: 1
    };

    this.airingRefs = {};
    this.shouldCancel = false;
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
    this.cancelProcess(false);
  }

  atOnceChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ atOnce: parseInt(event.currentTarget.value, 10) });
  };

  processVideo = async () => {
    const { airingList } = this.props;
    const { exportState, atOnce } = this.state;

    if (exportState === EXP_DONE) return;
    await this.setState({ exportState: EXP_WORKING });

    const actions = [];

    await asyncForEach(airingList, rec => {
      const ref = this.airingRefs[rec.object_id];
      actions.push(() => {
        if (ref.current && this.shouldCancel === false)
          return ref.current.processVideo();
      });
    });

    await throttleActions(actions, atOnce).then(results => {
      // console.log(results);
      return results;
    });

    this.setState({ exportState: EXP_DONE });
  };

  cancelProcess = async (updateState: boolean = true) => {
    const { airingList } = this.props;

    this.shouldCancel = true;

    await asyncForEach(airingList, async rec => {
      const ref = this.airingRefs[rec.object_id];
      if (ref && ref.current) await ref.current.cancelProcess();
      return new Promise(() => {});
    });

    if (updateState) this.setState({ exportState: EXP_CANCEL });
  };

  close = async () => {
    this.shouldCancel = false;
    this.setState({
      opened: false,
      exportState: EXP_WAITING
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

    const { opened, exportState, atOnce } = this.state;

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
          size="1000"
          show={opened}
          onHide={this.close}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Export
              {os.platform() === 'darwin' ? (
                <Badge variant="warning" className="ml-4">
                  <span className="fab fa-apple  pr-1" />
                  Uh-oh! Exporting on Macs currently (probably) doesn&apos;t
                  work
                </Badge>
              ) : (
                ''
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {airingList.map(airing => {
              const ref = this.airingRefs[airing.object_id];
              return (
                <RecordingExport
                  ref={ref}
                  airing={airing}
                  key={`RecordingExport-${airing.object_id}`}
                />
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <ExportButton
              state={exportState}
              atOnce={atOnce}
              atOnceChange={this.atOnceChange}
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
  const { state, cancel, close, process, atOnce, atOnceChange } = prop;
  // , atOnce, atOnceChange

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

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Row>
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

/**
 <Col md="auto">
 <InputGroup size="sm">
 <InputGroup.Prepend>
 <InputGroup.Text>Max:</InputGroup.Text>
 </InputGroup.Prepend>
 <Form.Control
 as="select"
 value={atOnce}
 aria-describedby="btnState"
 onChange={atOnceChange}
 >
 <option>1</option>
 <option>2</option>
 <option>3</option>
 <option>4</option>
 </Form.Control>
 </InputGroup>
 </Col>
* */
