import { isEqual } from 'lodash';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { show } from 'redux-modal';
import { StoreState } from '../../../common/store';
import { AuthStatus, login } from '../../../common/store/auth';
import UtilitiesModal from '../app/components/modals/UtilitiesModel/UtilitiesModal';
import Button from '../_shared/Button/Button';

const logo_url = require('../../../assets/img/auryo-dark.png');
const feetonmusicbox = require('../../../assets/img/feetonmusicbox.jpg');

interface PropsFromState extends AuthStatus {
}

interface PropsFromDispatch {
    login: typeof login;
    show: typeof show;
}

type AllProps = PropsFromState & PropsFromDispatch;

class LoginContainer extends React.Component<AllProps> {

    shouldComponentUpdate(nextProps: AllProps) {
        const { error, loading } = this.props;

        return !isEqual(nextProps.loading, loading) ||
            !isEqual(nextProps.error, error);
    }

    login = () => {
        const { login, loading } = this.props;

        if (!loading) {
            login();
        }
    }

    render() {
        const { loading, error, show } = this.props;

        return (
            <div
                id='login'
                className='container-fluid'
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
                    <div className='login-wrap col-12 col-md-5'>

                        <div>
                            <div className='login-img-wrap'>
                                <img className='img-fluid' src={logo_url} />
                            </div>
                            <div className='sub-title'>
                                A SoundCloud client for your desktop. This project is open-source, so consider{' '}
                                <a href='https://github.com/Superjo149/auryo'>contributing</a> or becoming{' '}
                                <a href='https://opencollective.com/auryo'>a financial backer</a>. But most of all, enjoy the music. 🎉
                            </div>

                            <div className='login_section'>
                                {
                                    error ? (
                                        <div className='alert alert-danger'>
                                            {error}
                                        </div>
                                    ) : null
                                }

                                <strong>Login using SoundCloud</strong>

                                <Button
                                    color='primary'
                                    loading={loading}
                                    block={true}
                                    onClick={this.login}
                                    href='javascript:void(0)'
                                >
                                    Login
                                </Button>

                                <a
                                    href='javascript:void(0)'
                                    className='settings btn btn-link mt-1 btn-block'
                                    onClick={() => {
                                        show('utilities', {
                                            activeTab: 'settings'
                                        });
                                    }}
                                >
                                    Settings
                                </a>
                            </div>

                        </div>
                    </div>

                </div>
                <div className='sponsors'>
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
    ...state.auth.authentication
});

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, {}> = (dispatch) => bindActionCreators({
    login,
    show
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);
