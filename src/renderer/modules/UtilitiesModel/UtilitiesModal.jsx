import cn from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { connectModal } from 'redux-modal';
import * as actions from '../../../shared/actions/config.actions';
import AboutTab from './about/AboutTab';
import SettingsTab from './settings/SettingsTab';
import './UtilitiesModal.scss';

class UtilitiesModal extends Component {
    constructor(props) {
        super();

        this.state = {
            activeTab: props.activeTab || 'about' // eslint-disable-line
        }
    }

    toggle = (tab) => {
        const { activeTab } = this.state;

        if (activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    render() {
        const { show, handleHide } = this.props
        const { activeTab } = this.state;

        return (
            <Modal isOpen={show} toggle={handleHide} className="utilities">
                <ModalBody>
                    <div className="close">
                        <a href="javascript:void(0)" onClick={handleHide}><i className="icon-close" /></a>
                    </div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={cn({ active: activeTab === 'about' })}
                                onClick={() => {
                                    this.toggle('about')
                                }}
                            >
                                <i className="icon-info" />
                                <div>About</div>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={cn({ active: activeTab === 'settings' })}
                                onClick={() => {
                                    this.toggle('settings')
                                }}
                            >
                                <i className="icon-cog" />
                                <div>Settings</div>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="about">
                            <AboutTab />
                        </TabPane>
                        <TabPane tabId="settings">
                            <SettingsTab {...this.props} />
                        </TabPane>
                    </TabContent>
                </ModalBody>
            </Modal>
        )
    }
}

UtilitiesModal.propTypes = {
    show: PropTypes.bool,
    authenticated: PropTypes.bool,
    handleHide: PropTypes.func.isRequired,
}

UtilitiesModal.defaultProps = {
    show: false,
    authenticated: false,
}


const mapStateToProps = (state) => {
    const { config } = state

    return {
        config
    }
}

export default connectModal({ name: 'utilities' })(connect(mapStateToProps, actions)(UtilitiesModal))