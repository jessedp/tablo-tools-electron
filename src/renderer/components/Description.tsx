import { useState } from 'react';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Button from 'react-bootstrap/Button';

type Prop = {
  description: string;
};

export default function Description(prop: Prop) {
  const [show, setShow] = useState(false);
  const { description } = prop;
  if (!description) return <></>; //

  if (!show)
    return (
      <Button
        variant="link"
        size={'xs' as any}
        onClick={() => setShow(true)}
        className="text-black-50"
        title="Open description"
      >
        <span className="fa fa-arrow-alt-circle-right" />
      </Button>
    );
  return (
    <>
      <Button
        variant="link"
        size={'xs' as any}
        onClick={() => setShow(false)}
        className="pr-2 text-black-50"
        title="Open description"
      >
        <span className="fa fa-arrow-alt-circle-left" />
      </Button>
      <span className="description">{description}</span>
    </> //
  );
}
export function Description2(prop: Prop) {
  const { description } = prop;
  if (!description) return <></>; //

  const popover = (
    <Popover id="popover-basic">
      <Popover.Content>{description}</Popover.Content>
    </Popover>
  );
  return (
    <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
      <span
        className="fa fa-scroll pl-2"
        style={{
          color: '#A9A9A9',
        }}
      />
    </OverlayTrigger>
  );
}
