import { useEffect, useState } from 'react';
import { DiskSpace } from 'check-disk-space';
import { readableBytes } from '../utils/utils';

type Props = {
  filename: string;
  videoSize: number;
  displayPath?: boolean;
};

export default function DiskInfo(props: Props) {
  const { displayPath, filename, videoSize } = props;

  const [diskStats, setDiskStats] = useState<DiskSpace>({
    diskPath: '',
    size: 0,
    free: 0,
  });

  useEffect(() => {
    const getDiskStats = async (file: string) => {
      const stats = await window.fs.checkDiskSpace(file);
      setDiskStats(stats);
    };
    getDiskStats(filename).catch(console.error);
  }, [filename]);

  // console.log('airing.videoDetails.size', videoSize);
  // console.log('diskStats', diskStats);
  const spaceLeft = diskStats.free - videoSize;
  const percentSpaceLeft = spaceLeft / diskStats.free;

  // console.log('spaceLeft : ', spaceLeft);
  // console.log('percentSpaceLeft : ', percentSpaceLeft);

  const icon = 'fas pr-1';
  if (percentSpaceLeft >= 0.05) return <></>;

  if (spaceLeft < 0) {
    return (
      <span className="text-danger ">
        {displayPath ? (
          <strong>
            {filename}
            <br />
          </strong>
        ) : (
          <></>
        )}
        <span className={`${icon} fa-bomb`} />
        This disk does not have enough space! Has{' '}
        <b>{readableBytes(diskStats.free)}</b>, but needs:{' '}
        <b>{readableBytes(videoSize)}</b>
        <br />
      </span>
    );
  }

  return (
    <span className="text-warning ">
      {displayPath ? (
        <strong>
          {filename}
          <br />
        </strong>
      ) : (
        <></>
      )}
      <span className={`${icon} fa-exclamation-triangle`} />
      This disk is running low on space! {readableBytes(
        videoSize
      )} required, {readableBytes(diskStats.free)} available
      <br />
    </span>
  );
}

DiskInfo.defaultProps = { displayPath: false };
