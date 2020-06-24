// @flow

import React, { Component } from 'react';

import AceEditor from 'react-ace';

// import 'ace-builds/webpack-resolver';

import 'ace-builds/src-noconflict/mode-handlebars';
import 'ace-builds/src-noconflict/theme-kuroir';
import 'ace-builds/src-noconflict/ext-language_tools';
// import ace from 'ace-builds/src-noconflict/ace';

// ace.config.set('basePath', '');

// const defaultValue = `{{episodePath}}/{{showTitle}}/Season {{seasonNum}]/{{showTitle}} - {{this.episodeNum}}.{{EXT}}`;

// require(`ace-builds/src-noconflict/mode-handlebars`);
// require(`ace-builds/src-noconflict/theme-github`);

type Props = { value: string, updateValue: (value: string) => void };
type State = { workingValue: string };

class TemplateEditor extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { workingValue: props.value };

    this.onChange = this.onChange.bind(this);
  }

  onLoad() {
    console.log("i've loaded");
    this.noop();
  }

  onChange = (value: string) => {
    const { updateValue } = this.props;

    const workingValue = value.trim();
    console.log('change', workingValue);
    this.setState({ workingValue });
    updateValue(workingValue);
  };

  onSelectionChange(newValue, event) {
    console.log('select-change', newValue);
    console.log('select-change-event', event);
    this.noop();
  }

  onCursorChange(newValue, event) {
    console.log('cursor-change', newValue);
    console.log('cursor-change-event', event);
    this.noop();
  }

  onValidate(annotations) {
    console.log('onValidate', annotations);
    this.noop();
  }

  noop = () => {};

  render() {
    const { workingValue } = this.state;
    return (
      <div className="columns">
        <div className="examples column border m-2">
          <AceEditor
            placeholder="Start entering a template..."
            width="900px"
            lineHeight="30px"
            minLines={2}
            maxLines={2}
            mode="handlebars"
            theme="kuroir"
            name="blah2"
            onLoad={this.onLoad}
            onChange={this.onChange}
            onSelectionChange={this.onSelectionChange}
            onCursorChange={this.onCursorChange}
            onValidate={this.onValidate}
            value={workingValue}
            fontSize="16px"
            showPrintMargin={false}
            showGutter={false}
            highlightActiveLine={false}
            setOptions={{
              useWorker: false,
              showLineNumbers: false,
              tabSize: 2
            }}
          />
        </div>
      </div>
    );
  }
}
export default TemplateEditor;
