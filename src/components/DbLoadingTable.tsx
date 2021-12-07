import React from 'react';
import { Alert, Container, ProgressBar, Spinner } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import {
  STATE_WAITING,
  STATE_LOADING,
  STATE_FINISH,
  STATE_ERROR,
} from '../constants/app';

import { DbSliceState, updateProgress } from '../store/build';

export default function DbLoadingTable() {
  const progress: DbSliceState = useSelector((state) => state.build);

  const dispatch = useDispatch();

  const { loading, log, airingMax, airingInc } = progress;

  if (loading === STATE_WAITING) {
    return <></>;
  }

  let progressVariant = 'info';

  if (loading === STATE_LOADING) {
    const pct = Math.round(((airingInc || 0) / (airingMax || 1)) * 100);
    const airingPct = `${pct}%`;

    if (pct < 25) {
      progressVariant = 'danger';
    } else if (pct < 50) {
      progressVariant = 'warning';
    } else if (pct < 75) {
      progressVariant = 'info';
    } else {
      progressVariant = 'success';
    }

    return (
      <Container>
        <h6 className="p-3">Finding Recordings...</h6>
        <ProgressBar
          animated
          max={airingMax}
          now={airingInc}
          label={airingPct}
          variant={progressVariant}
        />
        {airingInc === airingMax ? (
          <div>
            <h6 className="p-3">Finishing up...</h6>
            <div className="pl-5 pt-1">
              {' '}
              <Spinner animation="grow" variant="primary" />
            </div>
          </div>
        ) : (
          ''
        )}
      </Container>
    );
  }

  if (loading === STATE_FINISH) {
    setTimeout(() => {
      dispatch(
        updateProgress({
          loading: STATE_WAITING,
        })
      );
    }, 3000);
    const txt = log ? [...log].pop() : '';
    return (
      <Container>
        <Alert className="fade m-2" variant="success">
          Done! {txt}
        </Alert>
      </Container>
    );
  }

  if (loading === STATE_ERROR) {
    setTimeout(() => {
      dispatch(
        updateProgress({
          loading: STATE_WAITING,
        })
      );
    }, 5000);
    return (
      <Container>
        <Alert className="fade m-2" variant="danger">
          <b>Problem building...</b>
          <br />
          {log ? log[0] : ''}
        </Alert>
      </Container>
    );
  }

  return <></>;
}
