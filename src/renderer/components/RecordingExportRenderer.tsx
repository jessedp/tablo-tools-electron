import { PureComponent } from 'react';
import RecordingExport from './RecordingExport';

import Airing from '../utils/Airing';
import { ExportRecordType } from '../constants/types';

interface ItemRendererProps {
  index: number;
  data: { list: ExportRecordType[]; actionOnDuplicate: string };
  style: any;
}

class RecordingExportRenderer extends PureComponent<ItemRendererProps> {
  render() {
    const { index, data, style } = this.props;
    // Access the items array using the "data" prop:
    const item = data.list[index];
    const { actionOnDuplicate } = data;

    return (
      <div style={style} key={`RecordingExport-${item.airing.object_id}`}>
        <RecordingExport
          airing={new Airing(item.airing)}
          actionOnDuplicate={actionOnDuplicate}
        />
      </div>
    );
  }
}

export default RecordingExportRenderer;
