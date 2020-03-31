// @flow
import React from 'react';

import { formatDistanceToNow, format } from 'date-fns';

type Props = { date: string | Date | null };

export default function RelativeDate(props: Props) {
  let { date } = props;
  if (typeof date === 'string') {
    date = Date.parse(date);
  }

  if (!date) return <>Never</>;

  return (
    <span title={format(date, 'ccc M/d/yy @ h:m:s a')}>
      {formatDistanceToNow(date)} ago
      <span
        className="pl-1 fa fa-question-circle text-muted"
        title={format(date, 'ccc M/d/yy @ h:m:s a')}
      />
    </span>
  );
}
