import { useState } from 'react';
import { Button } from 'react-bootstrap';
import Airing from 'renderer/utils/Airing';

function ToggleProtected(props: { airing: Airing }) {
  const { airing } = props;
  const { userInfo } = airing;

  const [currentState, setState] = useState(userInfo.protected as boolean);
  const [bgColor, setBgColor] = useState('');

  const toggle = async () => {
    if (await airing.setProtected(!currentState)) {
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

  let title = 'Unprotected, set as Proected';
  const style = {
    fontSize: 'small',
    color: 'grey',
    outline: 'none',
    boxShadow: 'none',
    background: bgColor,
    paddingLeft: '0.5px',
  };

  if (currentState) {
    style.color = 'orangered';
    title = 'Protected, set as Unprotected';
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
      <span className="fa fa-lock" />
    </Button>
  );
}

export default ToggleProtected;
