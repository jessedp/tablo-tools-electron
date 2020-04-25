// @flow
import React from 'react';

import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

type Prop = { description: string };

export default function Description(prop: Prop) {
  const { description } = prop;
  if (!description) return <></>;

  const popover = (
    <Popover id="popover-basic">
      <Popover.Content>{description}</Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
      <span className="fa fa-scroll pl-2" style={{ color: '#A9A9A9' }} />
    </OverlayTrigger>
  );
}
