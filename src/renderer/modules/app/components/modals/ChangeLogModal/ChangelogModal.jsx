/* eslint-disable jsx-a11y/accessible-emoji */
import { Spinner } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Markdown from "react-markdown";
import { connect } from 'react-redux';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { connectModal } from 'redux-modal';
import * as actions from '../../../../../../shared/actions/config.actions';
import fetchToJson from '../../../../../../shared/api/helpers/fetchToJson';

class ChangeLogModal extends Component {

    state = {
        body: "",
        loading: false
    }

    componentDidMount() {
        this.setState({
            loading: true
        })
        return fetchToJson("https://api.github.com/repos/Superjo149/Auryo/releases/latest")
            .then(({ body }) => {
                this.setState({
                    body,
                    loading: false
                })
            })
            .catch(() => {
                this.setState({
                    loading: false
                })
            })
    }

    render() {
        const { show, handleHide, version } = this.props
        const { body, loading } = this.state

        return (
            <Modal isOpen={show} toggle={handleHide} className="changelog">
                <ModalHeader>
                    <div className="close">
                        <a href="javascript:void(0)" onClick={handleHide}><i className="icon-close" /></a>
                    </div>
                    What's new {version} ? <span>🎉</span></ModalHeader>
                <ModalBody>
                    {loading && (<Spinner contained />)}
                    <Markdown source={body} />

                    <div className="text-center">
                        <a href="https://github.com/Superjo149/auryo/releases" className="c_btn">older changelogs</a>
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}

ChangeLogModal.propTypes = {
    version: PropTypes.string.isRequired,
    show: PropTypes.bool,
    handleHide: PropTypes.func.isRequired,
}

ChangeLogModal.defaultProps = {
    show: false
}


const mapStateToProps = (state) => {
    const { config } = state

    return {
        config
    }
}

export default connectModal({ name: 'changelog' })(connect(mapStateToProps, actions)(ChangeLogModal))