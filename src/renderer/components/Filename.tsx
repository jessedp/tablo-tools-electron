import React, { useState } from 'react';

import { Row, Col, Badge } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import RecordingSlim from './RecordingSlim';
import { ON, OFF } from '../constants/app';
import Airing from '../utils/Airing';

type Props = {
  file: string;
  airings: Airing[];
};

export default function Filename(prop: Props) {
  const { file, airings } = prop;
  const [show, setShow] = useState(false);
  airings.sort((a, b) => {
    if (a.show.sortableTitle === b.show.sortableTitle) {
      return a.airingDetails.datetime > b.airingDetails.datetime ? -1 : 1;
    }

    return a.show.sortableTitle > b.show.sortableTitle ? -1 : 1;
  });
  const header = (
    <Row className="border-bottom mb-2">
      <Col md="1">
        <Badge pill variant="warning">
          {airings.length}
        </Badge>
      </Col>
      <Col>
        {show ? (
          <Button
            onClick={() => setShow(false)}
            variant="link"
            size={'xs' as any}
            title="Hide airings"
          >
            <span className="fa fa-toggle-on preview-toggle" />
          </Button>
        ) : (
          <Button
            onClick={() => setShow(true)}
            variant="link"
            size={'xs' as any}
            title="show airings"
          >
            <span className="fa fa-toggle-off preview-toggle" />
          </Button>
        )}
        <span className="ml-2">{file}</span>
      </Col>
    </Row>
  );

  if (!show) {
    return header;
  }

  return (
    <>
      {header}
      {airings.map((airing) => {
        return (
          <RecordingSlim
            airing={airing}
            key={`preview-${airing.id}`}
            withSelect={ON}
            withActions={OFF}
          />
        );
      })}
    </> //
  );
}
