import React, { Component } from 'react'
import { connect } from 'react-redux'
import { connectModal } from 'redux-modal'
import { Modal, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import cn from 'classnames'
import AboutTab from './about/AboutTab'
import SettingsTab from './settings/SettingsTab'
import './UtilitiesModal.scss'
import PropTypes from 'prop-types'
import * as actions from '../../../shared/actions/config.actions'

class UtilitiesModal extends Component {
    state = {
        activeTab: this.props.activeTab || 'about'
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    render() {
        const { show, handleHide } = this.props
        
        return (
            <Modal isOpen={show} toggle={handleHide} className="utilities">
                <ModalBody>
                    <div className="close">
                        <a href="javascript:void(0)" onClick={handleHide}><i className="icon-close" /></a>
                    </div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={cn({ active: this.state.activeTab === 'about' })}
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
                                className={cn({ active: this.state.activeTab === 'settings' })}
                                onClick={() => {
                                    this.toggle('settings')
                                }}
                            >
                                <i className="icon-cog" />
                                <div>Settings</div>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
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
    authenticated: PropTypes.bool
}


const mapStateToProps = (state, props) => {
    const { config } = state

    return {
        config
    }
}

export default connectModal({ name: 'utilities' })(connect(mapStateToProps, actions)(UtilitiesModal))