import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

import { Row, Col, Alert } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

import Airing from '../utils/Airing';
import Filename from './Filename';

type Props = {
  files: Record<string, any> | Array;
  total: number;
  label?;
};
export default function DuplicateNames(props: Props) {
  const { files, total, label } = props;
  const [show, setShow] = useState(false);

  if (Object.keys(files).length === 0) {
    return <></>;
  }

  if (!show) {
    const totalDupeCnt = total - Object.keys(files).length;
    const status = label || `${totalDupeCnt} / ${total}* are duplicates`;
    return (
      <Button
        variant="warning"
        onClick={() => setShow(true)}
        size={'xs' as any}
        className="ml-2"
      >
        <span className="fas fa-exclamation mr-2 naming-icons" />
        {status}
      </Button>
    );
  }

  type DupeRec = { file: string; airings: Airing[] };
  const dupes: DupeRec[] = [];

  if (Array.isArray(files)) {
    files.forEach((file: string) => {
      dupes.push({ file, airings: [] });
    });
  } else {
    // just assume it's a proper object
    Object.keys(files).forEach((file) => {
      console.log(typeof file, typeof files[file], files[file].length);
      if (files[file].length > 1) {
        dupes.push({
          file,
          airings: files[file],
        });
      }
    });
  }
  console.log('dupes', dupes);
  // console.log('2', dupes);
  dupes.sort((a, b) => (a.airings?.length > b.airings?.length ? -1 : 1));
  return (
    <Modal show={show} scrollable onHide={() => setShow(false)} size="lg">
      <Modal.Header closeButton>
        <Alert variant="warning" className="mb-0">
          {label ? (
            <span>{label}</span>
          ) : (
            <>
              {total - Object.keys(files).length} / {total} are duplicates
              <span className="smaller pl-2">(max 1000)</span>
            </>
          )}
        </Alert>
      </Modal.Header>
      <Modal.Body>
        <Row className="border-bottom mb-2">
          <Col md="1" className="bold">
            #
          </Col>
          <Col className="bold">duplicate filename</Col>
        </Row>

        {dupes.map((rec) => {
          return (
            <Filename file={rec.file} airings={rec.airings} key={rec.file} />
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
