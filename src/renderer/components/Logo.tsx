import { Image } from 'react-bootstrap';
import tabloLogo from '../../../assets/tablo_tools_logo.png';

export default function LogoBox() {
  return (
    <div className="selected-basket">
      <Image
        src={tabloLogo}
        style={{
          width: '125px',
        }}
      />
    </div>
  );
}
