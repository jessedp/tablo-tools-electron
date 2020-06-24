// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as FlashActions from '../actions/flash';
// import type { FlashRecordType } from '../reducers/types';
import { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';
import deepFilter from '../utils/deepFilter';
import getConfig from '../utils/config';
import Airing from '../utils/Airing';
import NamingTemplate from './NamingTemplate';

// const helpers = require('handlebars-helpers');

type Props = {};

type State = {
  examples: {}
};

class SettingsNaming extends Component<Props, State> {
  props: Props;

  builtIns: {};

  lastKey: string;

  constructor() {
    super();

    this.state = {
      examples: {}
    };

    this.selectJson = this.selectJson.bind(this);
  }

  componentDidMount = async () => {
    const config = getConfig();
    const { episodePath, moviePath, eventPath, programPath } = config;

    let recType = new RegExp(SERIES);
    let rec = await global.RecDb.asyncFindOne({ path: { $regex: recType } });
    const airing = new Airing(rec);

    const path = airing.typePath;
    const showRec = await global.ShowDb.asyncFindOne({ path });
    rec.show = showRec;
    const examples = {};
    examples[SERIES] = deepFilter(rec, (value: any, prop: any) => {
      // prop is an array index or an object key
      // subject is either an array or an object
      // console.log(value, prop, subject);
      if (prop && prop.toString().includes('path')) return false;
      if (prop && prop.toString().includes('error')) return false;
      if (prop && prop.toString().includes('warnings')) return false;
      if (prop && prop.toString().includes('_id')) return false;
      if (prop && prop.toString().includes('image')) return false;
      if (prop && prop.toString().includes('Image')) return false;
      if (prop && prop.toString().includes('user_info')) return false;

      return true;
    });

    recType = new RegExp(MOVIE);
    rec = await global.RecDb.asyncFindOne({ path: { $regex: recType } });

    examples[MOVIE] = rec;

    recType = new RegExp(EVENT);
    rec = await global.RecDb.asyncFindOne({ path: { $regex: recType } });
    examples[EVENT] = rec;

    recType = new RegExp(PROGRAM);
    rec = await global.RecDb.asyncCount({ path: { $regex: recType } });
    examples[PROGRAM] = rec;

    /** Setup our Built-in Shortcuts */
    this.builtIns = {
      episodePath,
      moviePath,
      eventPath,
      programPath,
      showTitle: airing.showTitle,
      seasonNum: airing.seasonNum,
      episodeNum: airing.episodeNum,
      EXT: 'mp4'
    };

    this.setState({ examples });
  };

  selectJson = (node: Object) => {
    const { location, pattern } = this.state;
    if (location.idx < 0) return;

    let path = node.namespace.join('.');
    path = `${path}.${node.name}`;
    const tag = `{{${path}}}`;

    const p1 = pattern[location.idx].slice(0, location.position);
    const p3 = pattern[location.idx].slice(location.position);
    pattern[location.idx] = `${p1}${tag}${p3}`;

    this.setState({ pattern });
    setTimeout(() => this.patternRefs[location.idx].current.focus(), 100);
  };

  render() {
    const { examples } = this.state;
    const {
      episodeTemplate,
      movieTemplate,
      eventTemplate,
      programTemplate
    } = getConfig();

    // const dataObj = { ...this.builtIns, ...examples[SERIES] };

    // const sanitizedParts = pattern.map((value, idx) => {
    //   Handlebars.registerHelper(helpers);
    //   let part = value;
    //   const template = Handlebars.compile(value);

    //   try {
    //     part = template(dataObj);
    //   } catch (e) {
    //     // set part = value (above)
    //     console.warn('Handlebars unable to parse', e);
    //   }

    //   if (idx === 0) return part;
    //   if (idx === pattern.length - 1) {
    //     ext = part;
    //     return '';
    //   }

    //   return sanitize(part);
    // });

    // let parsedPath = fsPath.join(...sanitizedParts);:
    // parsedPath = defaults[0];

    // const defaultPath =
    //   '{{episodePath}}/{{showTitle}}/Season {{seasonNum}]/{{showTitle}} - {{this.episodeNum}}.{{EXT}}';

    // global.NamingDb
    return (
      <div className="pl-1">
        <h2>Naming Templates</h2>

        <NamingTemplate
          label="Series/Episode"
          value={episodeTemplate}
          data={{ ...this.builtIns, ...examples[SERIES] }}
          airing={examples[SERIES]}
        />
        <NamingTemplate
          label="Movie"
          value={movieTemplate}
          data={{ ...this.builtIns, ...examples[MOVIE] }}
          airing={examples[MOVIE]}
        />
        <NamingTemplate
          label="Sport/Event"
          value={eventTemplate}
          data={{ ...this.builtIns, ...examples[EVENT] }}
          airing={examples[EVENT]}
        />
        <NamingTemplate
          label="Manual Recording"
          value={programTemplate}
          data={{ ...this.builtIns, ...examples[PROGRAM] }}
          airing={examples[PROGRAM]}
        />
      </div>
    );
  }
}

//         <Row>
//           <Col className="d-block">
//             <div className="mt-3">
//               {examples ? (
//                 <ReactJson
//                   src={examples[SERIES]}
//                   onSelect={this.selectJson}
//                   enableClipboard={false}
//                   collapsed={1}
//                   displayDataTypes={false}
//                 />
//               ) : (
//                 ''
//               )}
//             </div>
//           </Col>
//         </Row>
//         <div className="d-flex flex-row">
//           <TemplateEditor
//             value={defaultPath}
//             updateValue={this.updatePreview}
//           />
//         </div>

//       </div>
//     );
//   }
// }

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(SettingsNaming);
