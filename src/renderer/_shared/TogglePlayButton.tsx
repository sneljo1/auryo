import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { StoreState } from '../../common/store';
import { PlayerStatus, toggleStatus } from '../../common/store/player';

interface OwnProps {
    className?: string;
}

interface PropsFromState {
    status: PlayerStatus;
}

interface PropsFromDispatch {
    toggleStatus: typeof toggleStatus;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TogglePlayButton extends React.Component<AllProps> {

    togglePlay = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const { toggleStatus, status } = this.props;

        event.preventDefault();
        event.nativeEvent.stopImmediatePropagation();

        if (status !== PlayerStatus.PLAYING) {
            toggleStatus(PlayerStatus.PLAYING);
        } else if (status === PlayerStatus.PLAYING) {
            toggleStatus(PlayerStatus.PAUSED);
        }

    }

    render() {
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
                break;
        }

        return (
            <a
                href='javascript:void(0)'
                className={className}
                onClick={this.togglePlay}
            >
                <i className={`bx bx-${icon}`} />
            </a>
        );
    }
}

const mapStateToProps = ({ player: { status } }: StoreState): PropsFromState => ({
    status,
});


const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    toggleStatus
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TogglePlayButton);
