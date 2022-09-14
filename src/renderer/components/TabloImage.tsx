import Image from 'react-bootstrap/Image';
import unknownImg from '../../../assets/white-question-mark.png';
import { getTabloImageUrl } from '../utils/utils';

type Props = {
  imageId: number;
  title?: string;
  className: string;
};

function TabloImage(props: Props) {
  const { imageId, title, className } = props;
  const style = {};
  const fullClass = `${className} badge-light pt-5`;
  let url = unknownImg;

  if (imageId) {
    url = getTabloImageUrl(imageId);
    return (
      <Image
        title={title}
        style={style}
        src={url}
        className={className}
        fluid
        rounded
      />
    );
  }

  return (
    <div className={fullClass} style={style}>
      {title}
    </div>
  );
}
TabloImage.defaultProps = {
  title: '',
};

export default TabloImage;
