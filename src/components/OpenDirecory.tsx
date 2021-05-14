import React from 'react';
import Button from 'react-bootstrap/Button';
import { ipcRenderer } from 'electron';

type Props = {
  path: string;
};
export default function OpenDirectory(prop: Props) {
  const { path } = prop;

  const openDir = async () => {
    // await remote.shell.openPath(fsPath.dirname(path));
    ipcRenderer.send('open-path', path);
  };

  return (
    <Button
      variant="link"
      onClick={() => openDir()}
      title="Open directory"
      size={'xs' as any}
      className="p-0 mr-1"
    >
      <span className="fa fa-folder-open text-dark naming-icons" />
    </Button>
  );
}
