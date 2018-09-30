import cn from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { connectModal, IModalInjectedProps } from 'redux-modal';
import { StoreState } from '../../../../../../shared/store';
import AboutTab from './about/AboutTab';
import SettingsTab from './settings/SettingsTab';
import { ConfigState, setConfigKey } from '../../../../../../shared/store/config';
import { bindActionCreators, Dispatch } from 'redux';

interface PassedProps {
    activeTab?: TabType;
}

interface State {
    activeTab: TabType;
}

interface PropsFromState {
    config: ConfigState;
    authenticated?: boolean;
}

interface PropsFromDispatch {
    setConfigKey: typeof setConfigKey;
}

enum TabType {
    ABOUT = 'about',
    SETTINGS = 'settings'
}

type Props = PassedProps & PropsFromState & PropsFromDispatch & IModalInjectedProps;

class UtilitiesModal extends React.PureComponent<Props, State> {

    static defaultProps: Partial<Props> = {
        authenticated: false
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            activeTab: props.activeTab || TabType.ABOUT
        };
    }

    toggle = (tab: TabType) => {
        const { activeTab } = this.state;

        if (activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        const { show, handleHide } = this.props;
        const { activeTab } = this.state;

        return (
            <Modal isOpen={show} toggle={handleHide} className='utilities'>
                <ModalBody>
                    <div className='close'>
                        <a href='javascript:void(0)' onClick={handleHide}><i className='icon-close' /></a>
                    </div>
                    <Nav tabs={true}>
                        <NavItem>
                            <NavLink
                                className={cn({ active: activeTab === TabType.ABOUT })}
                                onClick={() => {
                                    this.toggle(TabType.ABOUT);
                                }}
                            >
                                <i className='icon-info' />
                                <div>About</div>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={cn({ active: activeTab === TabType.SETTINGS })}
                                onClick={() => {
                                    this.toggle(TabType.SETTINGS);
                                }}
                            >
                                <i className='icon-cog' />
                                <div>Settings</div>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId='about'>
                            <AboutTab />
                        </TabPane>
                        <TabPane tabId='settings'>
                            <SettingsTab {...this.props} />
                        </TabPane>
                    </TabContent>
                </ModalBody>
            </Modal>
        );
    }
}

const mapStateToProps = ({ config, auth }: StoreState): PropsFromState => ({
    config,
    authenticated: !!config.token && !auth.authentication.loading
});

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    setConfigKey
}, dispatch);

export default connectModal<PassedProps>({ name: 'utilities' })(connect(mapStateToProps, mapDispatchToProps)(UtilitiesModal) as any);
