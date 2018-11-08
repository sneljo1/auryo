import { ipcRenderer } from 'electron';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { show } from 'redux-modal';
import { StoreState } from '../../../common/store';
import { AuthStatus, login } from '../../../common/store/auth';
import UtilitiesModal from '../../app/components/modals/UtilitiesModel/UtilitiesModal';
import LoginStep from './components/LoginStep';
import WelcomeStep from './components/WelcomeStep';
import './OnBoarding.scss';
import PrivacyStep from './components/PrivacyStep';
import { setConfigKey, ConfigState } from '../../../common/store/config';
import * as cn from 'classnames';
import { RouteComponentProps } from 'react-router';

const feetonmusicbox = require('../../../assets/img/feetonmusicbox.jpg');

interface OwnProps extends RouteComponentProps<{}> {

}

interface PropsFromState extends AuthStatus {
    config: ConfigState;
}

interface PropsFromDispatch {
    login: typeof login;
    show: typeof show;
    setConfigKey: typeof setConfigKey;
}

interface State {
    step: 'welcome' | 'login' | 'privacy';
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class OnBoarding extends React.PureComponent<AllProps, State> {

    state: State = {
        step: 'login'
    };

    componentDidMount() {
        const { config: { lastLogin } } = this.props;

        if (!lastLogin) {
            ipcRenderer.once('login-success', () => {
                this.setState({
                    step: 'welcome'
                });
            });
        }
    }

    login = () => {
        const { login, loading } = this.props;

        this.setState({
            step: 'welcome'
        });

        if (!loading) {
            login();
        }
    }

    render() {
        const { loading, error, show, config, setConfigKey, history } = this.props;

        return (
            <div
                id='login'
                className={cn('login', { login_small: this.state.step === 'login' })}
            >
                <div className='login_svg'>
                    <svg preserveAspectRatio='xMinYMin meet' xmlns='http://www.w3.org/2000/svg' viewBox='442.89 75.141 1923 1204.859'>
                        <defs>
                            <pattern id='image' x='0' y='0' width='1' height='1'>
                                <image xlinkHref={feetonmusicbox} width='1923' height='1204.859' preserveAspectRatio='none' />
                            </pattern>
                        </defs>
                        <path
                            // tslint:disable-next-line:max-line-length
                            d=' M 1492.89 76.729 C 1494.781 76.669 1491.009 76.751 1492.89 76.729 Q 1688.207 74.452 1819.89 350.603 Q 1816.865 344.209 1819.89 350.603 Q 2002.369 736.338 2358.89 777.603 L 2365.89 1279.999 Q 442.89 1280.001 442.89 1279.999 C 446.431 1068.715 588.71 855.833 711.652 708.742 C 804.759 575.761 875.829 694.161 930.09 515.844 Q 932.515 507.875 934.89 499.603 Q 934.805 500.031 934.89 499.603 Q 1024.781 49.177 1492.89 76.729'
                            fill='url(#image)'
                        />
                    </svg>
                </div>

                <div className='row d-flex align-items-center'>
                    <div className={`login-wrap col-12 ${this.state.step !== 'login' ? 'col-md-6' : 'col-md-5'}`}>

                        {
                            this.state.step === 'login' && (
                                <LoginStep
                                    loading={loading}
                                    error={error}
                                    show={show}
                                    login={this.login}
                                />
                            )
                        }

                        {
                            this.state.step === 'welcome' && (
                                <WelcomeStep
                                    onNext={() => {
                                        this.setState({
                                            step: 'privacy'
                                        });
                                    }}
                                />
                            )
                        }

                        {
                            this.state.step === 'privacy' && (
                                <PrivacyStep
                                    config={config}
                                    setConfigKey={setConfigKey}
                                    onNext={() => {
                                        history.replace('/');
                                    }}
                                />
                            )
                        }

                    </div>

                </div>
                <div className='sponsors animated fadeInRight faster delay-1s'>
                    <strong>Our sponsors</strong>
                    <a href='https://opencollective.com/auryo'>
                        <img src='https://opencollective.com/auryo/tiers/platinum-sponsors-%F0%9F%9A%80.svg?avatarHeight=50' />
                    </a>
                </div>

                <UtilitiesModal />
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState): PropsFromState => ({
    ...state.auth.authentication,
    config: state.config
});

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, {}> = (dispatch) => bindActionCreators({
    login,
    show,
    setConfigKey,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(OnBoarding);
