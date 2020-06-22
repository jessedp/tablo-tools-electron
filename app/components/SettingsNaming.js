// @flow
import React, { Component } from 'react';
import * as fsPath from 'path';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Handlebars from 'handlebars';

import ReactJson from 'react-json-view';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import * as helpers from 'handlebars-helpers';

import * as FlashActions from '../actions/flash';
// import type { FlashRecordType } from '../reducers/types';
import { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';
import deepFilter from '../utils/deepFilter';
import getConfig from '../utils/config';
import Airing from '../utils/Airing';

const sanitize = require('sanitize-filename');

type Props = {};

type State = {
  examples: {},
  pattern: Array<string>,
  location: { idx: number, position: number }
};

class SettingsNaming extends Component<Props, State> {
  props: Props;

  builtIns: {};

  patternRefs: {};

  lastKey: string;

  constructor() {
    super();
    this.lastKey = '';
    this.patternRefs = {};

    this.state = {
      examples: {},
      pattern: [],
      location: { idx: -1, position: 0 }
    };

    this.setValue = this.setValue.bind(this);
    this.selectJson = this.selectJson.bind(this);
  }

  componentDidMount = async () => {
    const config = getConfig();
    const { episodePath, moviePath, eventPath, programPath } = config;

    const episodePattern: Array<string> = [];

    episodePattern.push('{{episodePath}}');
    episodePattern.push('{{showTitle}}');
    episodePattern.push('Season {{seasonNum}}');
    episodePattern.push('{{showTitle}} - {{episodeNum}}');
    episodePattern.push('{{EXT}}');

    const examples = {};

    let recType = new RegExp(SERIES);
    let rec = await global.RecDb.asyncFindOne({ path: { $regex: recType } });
    const airing = new Airing(rec);

    const path = airing.typePath;
    const showRec = await global.ShowDb.asyncFindOne({ path });
    rec.show = showRec;
    examples[SERIES] = deepFilter(rec, (value: any, prop: any) => {
      // console.log(value, prop, subject);
      if (prop && prop.toString().includes('path')) return false;
      if (prop && prop.toString().includes('error')) return false;
      if (prop && prop.toString().includes('warnings')) return false;
      if (prop && prop.toString().includes('_id')) return false;
      if (prop && prop.toString().includes('image')) return false;
      if (prop && prop.toString().includes('Image')) return false;
      if (prop && prop.toString().includes('user_info')) return false;
      // prop is an array index or an object key
      // subject is either an array or an object
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

    this.setState({ examples, pattern: episodePattern });
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
  };

  setValue = (event: SyntheticKeyboardEvent<HTMLInputElement>, idx: number) => {
    let { location } = this.state;
    let { pattern } = this.state;
    pattern = [...pattern];
    const prev = idx - 1;
    const next = idx + 1;

    let { value } = event.currentTarget;
    value = value.replace(fsPath.sep, '');

    const selStart = event.currentTarget.selectionStart;
    let resetLastKey = false;
    if (typeof event.key !== 'undefined') {
      if (event.key === fsPath.sep) {
        const p1 = value
          .slice(0, location.position - 1)
          .replace(fsPath.sep, '')
          .trim();
        const p2 = value
          .slice(location.position - 1)
          .replace(fsPath.sep, '')
          .trim();

        pattern[idx] = p1;
        pattern.splice(next, 0, p2);
        this.setState({ pattern });
        setTimeout(() => this.patternRefs[next].current.focus(), 100);
      } else if (event.key === 'Backspace' && idx !== 1) {
        // delete key, empty input
        if (value.trim() === '' || this.lastKey === 'Backspace') {
          pattern[prev] = `${pattern[prev].trim()} ${pattern[idx].trim()}`;
          pattern.splice(idx, 1);
          this.patternRefs[prev].current.focus();
          this.setState({ pattern });
          resetLastKey = true;
        } else {
          resetLastKey = false;
        }
      } else {
        pattern[idx] = value;
        this.setState({ pattern });
      }

      this.lastKey = event.key;
      if (resetLastKey) this.lastKey = 'RESET';
    } else {
      pattern[idx] = value;
      // save the cursor location so we can insert there later
      location = { idx, position: selStart };
      this.setState({ location, pattern });
    }
  };

  render() {
    const { examples, pattern } = this.state;

    // {{episodePath}}/{{showTitle}}/Season {{seasonNum}]/{{showTitle}} - {{this.episodeNum}}.{{EXT}}

    // episodePattern.forEach(item => console.log(typeof item));

    // console.log('episodePattern', episodePattern);
    // console.log('episodePattern', episodePattern.join('/'));

    // execute the compiled template and print the output to the console
    if (!pattern) return <></>; //

    const dataObj = { ...this.builtIns, ...examples[SERIES] };

    let ext = pattern[pattern.length - 1];
    const sanitizedParts = pattern.map((value, idx) => {
      // Handlebars.helpers = helpers;
      let part = value;
      const template = Handlebars.compile(value);
      // console.log('helpers', template.knownHelpers);
      // console.log(idx, 'val', value);

      try {
        part = template(dataObj);
      } catch (e) {
        // set part = value (above)
        console.warn('Handlebars unable to parse', e);
      }

      if (idx === 0) return part;
      if (idx === pattern.length - 1) {
        ext = part;
        return '';
      }

      return sanitize(part);
    });

    let parsedPath = fsPath.join(...sanitizedParts);
    parsedPath = `${parsedPath}.${ext}`;

    return (
      <div className="">
        <Row>
          <Col className="d-block">
            <div className="mt-3">
              {examples ? (
                <ReactJson
                  src={examples[SERIES]}
                  onSelect={this.selectJson}
                  enableClipboard={false}
                  collapsed={1}
                  displayDataTypes={false}
                />
              ) : (
                ''
              )}
            </div>
          </Col>
        </Row>
        <div className="d-flex flex-row">
          {pattern.map((val, idx, arr) => {
            this.patternRefs[idx] = React.createRef();
            const key = `name-segment-${idx}`;
            return (
              <>
                <NameSegment
                  value={val}
                  idx={idx}
                  setValue={this.setValue}
                  key={key}
                  arr={arr}
                  localRef={this.patternRefs[idx]}
                />
              </> //
            );
          })}
        </div>
        <div className="name-preview border mt-2 p-3 bg-light">
          {parsedPath}
        </div>
      </div>
    );
  }
}

type SegmentPropType = {
  idx: number,
  value: string,
  arr: Array<any>,
  setValue: (evt: any, idx: number) => void,
  localRef: any
};

const NameSegment = (prop: SegmentPropType) => {
  const { idx, value, arr, setValue, localRef } = prop;
  let disabled = false;

  const isNextToLast = arr.length === idx + 2;
  const isLast = arr.length === idx + 1;

  if (idx === 0 || isLast) disabled = true;
  const content = (
    <>
      <input
        key={`name-input-${idx}`}
        value={value}
        type="text"
        onKeyUp={evt => setValue(evt, idx)}
        onFocus={evt => setValue(evt, idx)}
        onBlur={evt => setValue(evt, idx)}
        onChange={evt => setValue(evt, idx)}
        onMouseDown={evt => setValue(evt, idx)}
        disabled={disabled}
        className="segment-input"
        size={value.length}
        ref={localRef}
      />

      {isNextToLast ? <span className="segment-delim">.</span> : ''}
      {!isLast && !isNextToLast ? (
        <span className="segment-delim">{fsPath.sep}</span>
      ) : (
        ''
      )}
    </>
  ); //

  return content;
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(SettingsNaming);
