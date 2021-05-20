import React from 'react';
import Button from 'react-bootstrap/Button';
import RelativeDate from './RelativeDate';
import { recDbCreated } from '../utils/db';

type Props = {
  build: any;
  recCount: number;
};

export default function BuildTitle(props: Props) {
  const { build, recCount } = props;

  if (recCount) {
    return (
      <>
        <span>
          Last checked: <RelativeDate date={recDbCreated()} />
        </span>
        <Button onClick={build} className="ml-auto mr-2" size="sm">
          Reload
        </Button>
      </>
    );
  }

  return (
    <>
      Please load your recordings first.
      <Button onClick={build} className="ml-auto mr-2" size="sm">
        Load
      </Button>
    </>
  );
}
