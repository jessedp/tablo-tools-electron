import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { startBuild } from '../store/build';
import RelativeDate from './RelativeDate';
import { recDbCreated } from '../utils/db';
import { STATE_LOADING } from '../constants/app';
import { RootState } from '../store';

export default function BuildTitle(): JSX.Element {
  const { loading } = useSelector((state: RootState) => state.build);
  const dispatch = useDispatch();

  if (loading === STATE_LOADING) return <></>;

  if (recDbCreated() !== 'never') {
    return (
      <>
        <span>
          Last checked: <RelativeDate date={recDbCreated()} />
        </span>
        <Button
          onClick={() => dispatch(startBuild())}
          className="ml-2"
          size="sm"
        >
          Reload
        </Button>
      </>
    );
  }

  return (
    <>
      Please load your recordings first.
      <Button
        onClick={() => dispatch(startBuild())}
        className="ml-auto mr-2"
        size="sm"
      >
        Load
      </Button>
    </>
  );
}
