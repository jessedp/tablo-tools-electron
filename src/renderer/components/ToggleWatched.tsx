import { useState } from 'react';
import { Button } from 'react-bootstrap';
import Airing from 'renderer/utils/Airing';

function ToggleWatched(props: { airing: Airing }) {
  const { airing } = props;
  const { userInfo } = airing;

  const [currentState, setState] = useState(userInfo.watched as boolean);
  const [bgColor, setBgColor] = useState('');

  const toggle = async () => {
    if (await airing.setWatched(!currentState)) {
      if (currentState) {
        setBgColor('silver');
      } else {
        setBgColor('orangered');
      }
      setState(!currentState);

      setTimeout(() => {
        setBgColor('');
      }, 350);
    } else {
      console.log('FAILED toggle set watch');
    }
  };

  let title = 'Unwatched, set as Watched';
  const style = {
    fontSize: 'small',
    color: 'grey',
    outline: 'none',
    boxShadow: 'none',
    background: bgColor,
  };

  if (currentState) {
    style.color = 'orangered';
    title = 'Watched, set as Unwatched';
  }

  return (
    <Button
      variant=""
      onClick={toggle}
      size={'xs' as any}
      style={style}
      title={title}
      className=""
    >
      <span className="fa fa-eye" />
    </Button>
  );
}

export default ToggleWatched;
