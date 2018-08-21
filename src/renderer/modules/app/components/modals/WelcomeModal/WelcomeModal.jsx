/* eslint-disable jsx-a11y/accessible-emoji */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { connectModal } from 'redux-modal';
import * as actions from '../../../../../../shared/actions/config.actions';
import "./WelcomeModal.scss";
import imgUrl from '../../../../../../assets/img/boombox.svg';

class WelcomeModal extends Component {

    render() {
        const { show, handleHide } = this.props

        return (
            <Modal isOpen={show} toggle={handleHide} className="welcome">
                <ModalBody>

                    <h2>Welcome to Auryo</h2>
                    <img className="logo" src={imgUrl} />
                    <div className="welcome__description">
Due to the limitations of SoundClouds APIs, we are limited to 15K request/day. After this, there will be a waiting period where 
no music can be listened. Also some music may not be available in the desktop version. Every song owner has the option to disable 
access for third party applications.
                    </div>
                    
                    <a href="javascript:void(0)" onClick={handleHide} className="btn btn-primary d-block">Let's go</a>
                </ModalBody>
            </Modal>
        )
    }
}

WelcomeModal.propTypes = {
    show: PropTypes.bool,
    handleHide: PropTypes.func.isRequired,
}

WelcomeModal.defaultProps = {
    show: false
}

const mapStateToProps = (state) => {
    const { config } = state

    return {
        config
    }
}

export default connectModal({ name: 'welcome' })(connect(mapStateToProps, actions)(WelcomeModal))