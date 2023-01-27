import { useEffect, useState } from 'react';
import ReactHlsPlayer from '@panelist/react-hls-player';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Channel from '../utils/Channel';

type Props = {
  channel: Channel;
};

function MyPlayerLive(props: Props) {
  const { channel } = props;
  // const { channel } = props;
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const watchPath = `${channel.path}/watch`;

  useEffect(() => {
    console.log('component mounted!');

    let data: any = null; // ugh

    let errorMsg = '';

    try {
      data = window.Tablo.post(watchPath);
      console.log('data', data);
    } catch (e) {
      console.warn(`Unable to load ${watchPath}`, e);
      errorMsg = `${e}`;
    }

    let watchUrl = '';

    if (data && data.playlist_url) {
      // TODO: better local/forward rewrites (probably elsewhere)
      if (window.Tablo.device().private_ip === '127.0.0.1') {
        const re = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,5}/;
        watchUrl = data.playlist_url.replace(re, '127.0.0.1:8888');
      } else {
        watchUrl = data.playlist_url;
      }
      setUrl(watchUrl);
      setError('');
    } else {
      errorMsg = 'Unable to load channel!';
      console.log(errorMsg);
      setError(errorMsg);
    }
  }, [watchPath]);

  if (!url && !error) {
    return (
      <div>
        <Spinner variant="success" size="sm" animation="grow" />
        <span className="muted">Adjusting the rabbit ears...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Uh-oh, unable to load <b>${channel.channel.network}</b> within 5s
        timeout. Please try again later.
      </Alert>
    );
  }

  return (
    <ReactHlsPlayer src={url} autoPlay controls width="100%" height="auto" />
  );
}

export default MyPlayerLive;
