import { formatDistanceToNow, format } from 'date-fns';
import { sendError } from 'renderer/utils/utils';

type Props = {
  date: string | number | Date | null;
  term?: string;
};
export default function RelativeDate(props: Props) {
  const { term } = props;
  let { date } = props;

  if (typeof date === 'string') {
    date = Date.parse(date);
  }

  if (!date) return <>Never</>; //

  let distance;
  try {
    distance = formatDistanceToNow(date);
  } catch (e) {
    sendError(e);
    return <>unknown ({date})</>;
  }
  if (distance === 'less than a minute') distance = '< 1 minute';
  return (
    <span
      title={format(date, 'ccc M/d/yy @ h:mm:ss a')}
      style={{
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
      }}
    >
      {distance} {term}
    </span>
  );
}
RelativeDate.defaultProps = {
  term: 'ago',
};
