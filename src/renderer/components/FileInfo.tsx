import { useEffect, useState } from 'react';

import {
  EXP_WAITING,
  EXP_WORKING,
  EXP_DONE,
  EXP_DELETE,
  NamingTemplateType,
  DUPE_OVERWRITE,
  DUPE_SKIP,
} from '../constants/app';

import Airing from '../utils/Airing';
import { readableBytes } from '../utils/utils';

import RelativeDate from './RelativeDate';
import FilenameEditor from './FilenameEditor';
import OpenDirectory from './OpenDirecory';

type FileInfoProps = {
  airing: Airing;
  exportState: number;
  actionOnDuplicate: string;
  updateTemplate: (template: NamingTemplateType) => void;
};

export default function FileInfo(props: FileInfoProps) {
  const { airing, actionOnDuplicate, exportState, updateTemplate } = props;

  const [dedupedExportFile, setDedupedExportFile] = useState('');
  const exists = window.fs.existsSync(airing.exportFile);
  useEffect(() => {
    const filename = window.Airing.dedupedExportFile(
      airing,
      actionOnDuplicate,
      airing.template
    );
    setDedupedExportFile(filename);
  }, [airing, actionOnDuplicate, airing.template]);

  if (!exists) {
    if (exportState === EXP_DONE) {
      return (
        <div className="p-0 m-0 smaller font-weight-bold text-danger">
          <span className="fa fa-exclamation pr-1" />
          <span className="pr-2">File does not exist after export.</span>
          <span>
            <OpenDirectory path={airing.exportFile} />
            {dedupedExportFile}
          </span>
        </div>
      );
    }

    return (
      <div className="p-0 m-0 smaller font-weight-bold text-success">
        <span className="fa fa-check-circle pr-1" />
        {airing.exportFile}
        {exportState === EXP_WAITING ? (
          <>
            <FilenameEditor airing={airing} updateTemplate={updateTemplate} />
            <OpenDirectory path={airing.exportFile} />
          </> //
        ) : (
          ''
        )}
      </div>
    );
  }

  const stats = window.fs.statSync(airing.exportFile);
  let showSize = true;
  let baseClass = 'p-0 m-0 smaller font-weight-bold';
  let icon = 'fa pr-1 ';
  let title = 'in progress....';

  if (exportState === EXP_WORKING || airing.exportFile !== dedupedExportFile) {
    showSize = false;
    baseClass = `${baseClass} text-warning`;
    title = 'Exporting...';

    if (airing.exportFile !== dedupedExportFile) {
      icon = `${icon} fa-check-circle`;
      title = 'New, de-duplicated name';
    } else {
      icon = `${icon} fa-cog`;
    }
  } else if (exportState === EXP_DONE || exportState === EXP_DELETE) {
    showSize = true;
    baseClass = `${baseClass} text-success`;
    icon = `${icon} fa-check-circle`;
    title = 'No exisiting file found';
  } else {
    showSize = true;
    baseClass = `${baseClass} text-danger`;
    title = 'File exists!';

    if (actionOnDuplicate === DUPE_OVERWRITE) {
      icon = `${icon} fa-bomb`;
      title = 'File exists, will be overwritten';
    } else if (actionOnDuplicate === DUPE_SKIP) {
      icon = `${icon} fa-forward`;
      title = 'File exists, will be skipped';
    } else {
      icon = `${icon} fa-exclamation`;
    }
  }

  return (
    <div className={baseClass} title={title}>
      <span className={icon} />
      <span className="">{dedupedExportFile}</span>
      {exportState === EXP_WAITING ? (
        <FilenameEditor airing={airing} updateTemplate={updateTemplate} />
      ) : (
        <span className="ml-1 mr-1" />
      )}

      <OpenDirectory path={dedupedExportFile} />
      <span className="pr-1">
        created <RelativeDate date={stats.ctime} />
      </span>
      {showSize ? (
        <span className="pr-1">({readableBytes(stats.size)})</span>
      ) : (
        ''
      )}
    </div>
  );
}
