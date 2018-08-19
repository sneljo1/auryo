import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { PLAYER_STATUS } from "../../../shared/constants";
import * as actions from "../../../shared/actions";

class TogglePlayButton extends React.Component {

    togglePlay = (e) => {
        const { toggleStatus, status } = this.props;

        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();

        if (status !== PLAYER_STATUS.PLAYING) {
            toggleStatus(PLAYER_STATUS.PLAYING);
        } else if (status === PLAYER_STATUS.PLAYING) {
            toggleStatus(PLAYER_STATUS.PAUSED);
        }

    }

    render() {
        const { status, className } = this.props;

        let icon = "";

        switch (status) {
            case PLAYER_STATUS.ERROR:
                icon = "icon-alert-circle";
                break;
            case PLAYER_STATUS.PLAYING:
                icon = "pause";
                break;
            case PLAYER_STATUS.PAUSED:
            case PLAYER_STATUS.STOPPED:
                icon = "play_arrow";
                break;
            case PLAYER_STATUS.LOADING:
                icon = "more_horiz";
                break;
            default:
                break;
        }

        return (
            <a href="javascript:void(0)" className={className} onClick={this.togglePlay}>
                <i className={`icon-${icon}`} />
            </a>
        );
    }
}

TogglePlayButton.propTypes = {
    status: PropTypes.string.isRequired,
    className: PropTypes.string,
    toggleStatus: PropTypes.func.isRequired
};

TogglePlayButton.defaultProps = {
    className: ""
}

const mapStateToProps = (state) => {
    const { player } = state;
    const { status } = player;

    return {
        status,
    };
}

export default connect(mapStateToProps, { toggleStatus: actions.toggleStatus })(TogglePlayButton);
