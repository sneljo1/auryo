import isEqual from 'lodash/isEqual';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { show } from 'redux-modal';
import logo_url from '../../../assets/img/auryo-dark.png';
import url from '../../../assets/img/feetonmusicbox.jpg';
import { StoreState } from '../../../shared/store';
import { AuthStatus, login } from '../../../shared/store/auth';
import UtilitiesModal from '../app/components/modals/UtilitiesModel/UtilitiesModal';
import Button from '../_shared/Button/Button';

interface PropsFromState extends AuthStatus {
}

interface PropsFromDispatch {
    login: typeof login;
    show: typeof show;
}

type AllProps = PropsFromState & PropsFromDispatch

class LoginContainer extends React.Component<AllProps> {

    shouldComponentUpdate(nextProps: AllProps) {
        const { error, loading } = this.props;

        return !isEqual(nextProps.loading, loading) ||
            !isEqual(nextProps.error, error)
    }

    login = () => {
        const { login, loading } = this.props;

        if (!loading) {
            login()
        }
    }

    render() {
        const { loading, error, show } = this.props

        return (
            <div id='login' className='container-fluid'>
                <div className='row align-items-center'>
                    <div className='login-wrap col-12 col-md-4 text-center p-5'>

                        <div>
                            <div className='login-img-wrap mb-5 px-3'>
                                <img className='img-fluid' src={logo_url} />
                            </div>

                            {
                                error ? (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                ) : null
                            }

                            <Button color="primary" loading={loading} block onClick={this.login}
                                href='javascript:void(0)'>
                                Login
                            </Button>

                            <a href="javascript:void(0)" className="settings btn btn-link mt-1 btn-block"
                                onClick={() => {
                                    show('utilities', {
                                        activeTab: 'settings'
                                    })
                                }}>
                                Settings
                            </a>

                        </div>

                    </div>
                    <div className='login-bg hidden-sm-down col hidden-sm-down grad-blue'
                        style={{ backgroundImage: `url(${url})` }} />

                </div>
                
                <UtilitiesModal />
            </div>
        )
    }
}

const mapStateToProps = (state: StoreState): PropsFromState => ({
    ...state.auth.authentication
});

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    login,
    show
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer)
