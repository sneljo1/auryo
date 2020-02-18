import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { PlayerStatus } from '@common/store/player';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

interface OwnProps {
  className?: string;
}

const mapStateToProps = ({ player: { status } }: StoreState) => ({
  status
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleStatus: actions.toggleStatus
    },
    dispatch
  );

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TogglePlayButton extends React.Component<AllProps> {
  public togglePlay = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const { toggleStatus, status } = this.props;

    event.preventDefault();
    event.nativeEvent.stopImmediatePropagation();

    if (status !== PlayerStatus.PLAYING) {
      toggleStatus(PlayerStatus.PLAYING);
    } else if (status === PlayerStatus.PLAYING) {
      toggleStatus(PlayerStatus.PAUSED);
    }
  };

  public render() {
    const { status, className } = this.props;

    let icon = '';

    switch (status) {
      // case PlayerStatus.ERROR:
      //     icon = "icon-alert-circle";
      //     break;
      case PlayerStatus.PLAYING:
        icon = 'pause';
        break;
      case PlayerStatus.PAUSED:
      case PlayerStatus.STOPPED:
        icon = 'play';
        break;
      // case PlayerStatus.LOADING:
      //     icon = "more_horiz";
      //     break;
      default:
    }

    return (
      <a href="javascript:void(0)" className={className} onClick={this.togglePlay}>
        <i className={`bx bx-${icon}`} />
      </a>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
  mapStateToProps,
  mapDispatchToProps
)(TogglePlayButton);
