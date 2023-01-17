import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Badge } from 'react-bootstrap';

import { useSelector } from 'react-redux';
import {
  EXP_WORKING,
  EXP_WAITING,
  EXP_DONE,
  EXP_CANCEL,
  EXP_FAIL,
} from '../constants/app';

import { RootState } from '../store';

const statusDisplay = (title: string, count: number, variant = 'info') => {
  return (
    <h5>
      <Badge
        className="ml-1 mr-1 p-2"
        variant={variant}
        style={{ minWidth: '85%', maxWidth: '85%' }}
      >
        {title}
        <h5 className="mb-0">{count}</h5>
      </Badge>
    </h5>
  );
};

export default function ExportStatus(prop: Record<string, any>) {
  const { state } = prop;

  const recs = useSelector((Rstate: RootState) => Rstate.exportList);
  const waiting = recs.records.filter(
    (rec) => rec.state === EXP_WAITING
  ).length;
  const exporting = recs.records.filter(
    (rec) => rec.state === EXP_WORKING
  ).length;
  const finished = recs.records.filter((rec) => rec.state === EXP_DONE).length;
  const canceled = recs.records.filter(
    (rec) => rec.state === EXP_CANCEL
  ).length;
  const failed = recs.records.filter((rec) => rec.state === EXP_FAIL).length;
  // const working =

  if (state !== EXP_WAITING) {
    return (
      <Row>
        <Col md="1" />
        <Col md="2">{statusDisplay('Waiting', waiting, 'info')}</Col>
        <Col md="2">{statusDisplay('Exporting', exporting, 'warning')}</Col>
        <Col md="2">{statusDisplay('Finished', finished, 'success')}</Col>
        <Col md="2">{statusDisplay('Canceled', canceled, 'danger')}</Col>
        <Col md="2">{statusDisplay('Failed', failed, 'dark')}</Col>
      </Row>
    );
  }
  return <></>;
}
