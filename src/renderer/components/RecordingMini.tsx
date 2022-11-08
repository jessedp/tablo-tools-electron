import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as ActionListActions from '../store/actionList';
import TitleSlim from './TitleSlim';
import AiringStatus from './AiringStatus';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';
import { StdObj } from '../constants/types';
import { ON, OFF } from '../constants/app';

type OwnProps = {
  doDelete?: () => undefined;
  airing: Airing;

  withShow?: number;
  withSelect?: number;
};

type StateProps = {
  checked: number;
};

type DispatchProps = {
  addAiring: (arg0: StdObj) => void;
  remAiring: (arg0: StdObj) => void;
};

type Props = OwnProps & StateProps & DispatchProps;
class RecordingMini extends Component<Props> {
  static defaultProps: Record<string, any>;

  constructor(props: Props) {
    super(props);

    this.deleteAiring = this.deleteAiring.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { checked } = this.props;

    if (prevProps.checked !== checked) {
      this.render();
    }
  }

  deleteAiring = async () => {
    const { airing, doDelete } = this.props;
    await airing.delete();
    // shouldn't have to do this?
    if (doDelete) doDelete();
  };

  toggleSelection = async () => {
    const { airing, checked, addAiring, remAiring } = this.props;
    if (checked === CHECKBOX_ON) remAiring(airing.data);
    else addAiring(airing.data);
  };

  render() {
    const { airing, checked, withShow, withSelect } = this.props;

    let showCol = <></>;
    let chkCol = <></>;

    if (withShow === ON) {
      showCol = (
        <div className="d-inline-block align-top mr-2 ">
          <TabloImage imageId={airing.thumbnail} className="menu-image-md" />
        </div>
      );
    }

    if (withSelect === ON) {
      chkCol = (
        <div className="pl-2 pt-1 d-inline-block">
          <Checkbox checked={checked} handleChange={this.toggleSelection} />
        </div>
      );
    }

    return (
      <>
        <Row
          className="border-bottom mb-1 pb-1 pr-2"
          style={{
            width: '100%',
            maxHeight: '55px',
          }}
        >
          <Col md="8">
            {showCol}
            <TitleSlim airing={airing} withShow={ON} />
          </Col>
          <Col md="4" className="mr-0 pr-0">
            <div className="">
              <div className="d-flex flex-row-reverse d-block">
                {chkCol}
                <div className="smaller text-secondary align-top d-inline-block pt-1">
                  <span className="fa fa-clock pr-1" />
                  {airing.actualDuration} / {airing.duration}
                </div>
                <div className="d-inline-block mr-3">
                  <AiringStatus airing={airing} />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </> //
    );
  }
}

RecordingMini.defaultProps = {
  doDelete: () => undefined,
  withShow: OFF,
  withSelect: OFF,
};

const mapStateToProps = (state: any, ownProps: OwnProps) => {
  const { records } = state.actionList;
  const { airing } = ownProps;
  return {
    checked: records.find((item: StdObj) => item.object_id === airing.object_id)
      ? CHECKBOX_ON
      : CHECKBOX_OFF,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(RecordingMini);
