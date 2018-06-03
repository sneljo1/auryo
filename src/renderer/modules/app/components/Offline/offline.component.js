import React, {Component} from "react";
import PropTypes from "prop-types";
import {Alert} from "reactstrap";
import Spinner from "../../../_shared/Spinner/spinner.component";
import "./offline.scss";

class Offline extends Component {
    render() {
        const {full} = this.props;

        if (!full) {
            return (
                <div className="offline">
                    <Alert color="info" className="m-a-0">
                        <i className="icon-alert-circle"/> You are currently offline, please reconnect!
                    </Alert>

                </div>
            )
        }
        return (
            <div className="offline full">
                <div className="img-overlay" style={{backgroundImage: 'url(assets/img/feetonmusicbox.jpg)'}}></div>
                <div className="offline-content">
                    <h2>You seem to be offline</h2>
                    <p>But we got this, you just have to reconnect.</p>
                    <Spinner />
                </div>
            </div>

        );
    }
}

Offline.propTypes = {
    full: PropTypes.bool
};

export default Offline;
