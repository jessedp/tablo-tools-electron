import { useState, useEffect } from 'react';

import { build } from './ffmpeg';
import util from './util';
import tooltips from './tooltips';
import './command.css';
import { CmdFragment } from '../../constants/types';
import CommandFragment from './CommandFragment';

type Props = { options: any };

function Command(props: Props) {
  const { options } = props;

  const [fragments, setFragments] = useState([]);

  useEffect(() => {
    // getToolTips(commandsStr) {
    const commandsStr = build(util.transform(options));
    const cmd = commandsStr.split(' ');
    const output: any = [];
    let skip: number;

    // Map tooltip descriptions for known options.
    cmd.forEach((el, i) => {
      if (skip === i) return;

      const fragmentObj: CmdFragment = {
        id: `${el}-${i}`,
        value: el,
        description: '',
        filters: [],
      };
      const desc = tooltips.find((t) => t.value === el);
      if (desc) {
        fragmentObj.description = desc.tip;
      }

      // Get filter fragments.
      if (el === '-vf' || el === '-af') {
        const filtersOutput: CmdFragment[] = [];
        const filters = cmd[i + 1].split(',');
        filters.forEach((filter) => {
          const f: CmdFragment = {
            id: `${el}-${filter}-${i}`,
            value: filter,
            description: '',
          };
          const filterDesc = tooltips.find((t) => filter.includes(t.value));
          if (filterDesc) {
            f.description = filterDesc.tip;
          }
          filtersOutput.push(f);
        });
        fragmentObj.filters = filtersOutput;
        skip = i + 1;
      }
      output.push(fragmentObj);
    });
    setFragments(output);
  }, [options, setFragments]);

  return (
    <code className="command-box">
      {fragments.map((el: CmdFragment) => {
        return <CommandFragment fragment={el} key={el.id} />;
      })}
    </code>
  );
}

export default Command;
