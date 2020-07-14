// @flow
import React from 'react';
import * as fsPath from 'path';

import { Button } from 'react-bootstrap';

// import { shell } from 'electron';

const { remote } = require('electron');

type Props = { path: string };
export default function OpenDirectory(prop: Props) {
  const { path } = prop;

  const openDir = () => {
    remote.shell.openItem(fsPath.dirname(path));
  };

  return (
    <Button
      variant="link"
      onClick={() => openDir()}
      title="Open directory"
      size="xs"
      className="p-0 mr-1"
    >
      <span className="fa fa-folder-open text-dark naming-icons" />
    </Button>
  );
}
