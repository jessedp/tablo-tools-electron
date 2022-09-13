import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  STATE_WAITING,
  STATE_LOADING,
  STATE_FINISH,
  STATE_ERROR,
} from '../constants/app';

import { DbSliceState } from '../store/build';

export default function DbLoading(): JSX.Element {
  const progress: DbSliceState = useSelector((state: RootState) => state.build);

  const { loading, airingMax, airingInc } = progress;

  if (loading === STATE_WAITING) {
    return <></>;
  }

  let progressVariant = 'badge-danger';

  if (loading === STATE_LOADING) {
    const pct = Math.round(((airingInc || 0) / (airingMax || 1)) * 100);

    // console.log('loading pct', pct);
    // const airingPct = `${pct}%`;
    if (pct < 25) {
      progressVariant = 'badge-danger';
    } else if (pct < 50) {
      progressVariant = 'badge-warning';
    } else if (pct < 75) {
      progressVariant = 'badge-info';
    } else {
      progressVariant = 'badge-success';
    }

    return (
      <div className={`sk-folding-cube ${progressVariant}`}>
        <div className="sk-cube1 sk-cube" />
        <div className="sk-cube2 sk-cube" />
        <div className="sk-cube4 sk-cube" />
        <div className="sk-cube3 sk-cube" />
      </div>
    );
  }

  if (loading === STATE_ERROR) {
    return (
      <>
        <span className="fa fa-exclamation-triangle pr-1 text-danger" />
      </>
    );
  }

  if (loading === STATE_FINISH) return <></>;

  return <></>;
}
