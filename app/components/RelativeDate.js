// @flow
import React from 'react';

import { formatDistanceToNow, format } from 'date-fns';

type Props = { date: string | Date | null, term?: string };

export default function RelativeDate(props: Props) {
  const { term } = props;
  let { date } = props;
  if (typeof date === 'string') {
    date = Date.parse(date);
  }

  if (!date) return <>Never</>;

  return (
    <span
      title={format(date, 'ccc M/d/yy @ h:m:s a')}
      style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
    >
      {formatDistanceToNow(date)} {term}
    </span>
  );
}
RelativeDate.defaultProps = { term: 'ago' };
