import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// this is essentially a basic stick an array of strings in a modal
export default function FfmpegLog(props: { log: string[] }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);

  const { log } = props;
  // const log = [];
  // for (let i = 0; i < 100; i += 1) log.push('xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx ');

  if (!log || log.length === 0) return <i>No log</i>;
  let logData = [];
  if (!Array.isArray(log)) {
    if (typeof log === 'object') {
      logData = [`${log}`];
    } else if (`${log}`.includes('status code 404')) {
      const newLog = `MISSING RECORDING, PLEASE TRY RELOADING (${log})`;
      logData = [newLog];
    } else {
      logData = [log];
    }
  } else {
    logData = log;
  }
  let i = 0;
  return (
    <>
      <Button size={'xs' as any} variant="primary" onClick={handleShow}>
        <span className="fa fa-info-circle" /> log
      </Button>

      <Modal size="lg" show={show} onHide={handleClose} scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Export Log</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-monospace smaller">
          {logData.map((row) => {
            i += 1;
            return (
              <div className="border-bottom" key={`logrow-${i}`}>
                {row}
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </> //
  );
}
