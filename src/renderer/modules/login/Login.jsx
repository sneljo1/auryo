import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import url from '../../../assets/img/feetonmusicbox.jpg'
import logo_url from '../../../assets/img/auryo-dark.png'
import './login.scss'
import { login } from '../../../shared/actions/auth/auth.actions'
import Button from '../_shared/Button/Button'
import { isEqual } from 'lodash'
import { show } from 'redux-modal'
import UtilitiesModal from '../UtilitiesModel/UtilitiesModal'

class LoginContainer extends React.Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !isEqual(nextProps.loading, this.props.loading) ||
            !isEqual(nextProps.error, this.props.error)
    }

    constructor() {
        super()

        this.login = this.login.bind(this)
    }

    login() {
        if (!this.props.loading) {
            this.props.login()
        }
    }

    render() {
        const { loading, error } = this.props

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
                                   this.props.show('utilities', {
                                       activeTab: 'settings'
                                   })
                               }}>
                                Settings
                            </a>

                        </div>

                    </div>
                    <div className='login-bg hidden-sm-down col hidden-sm-down grad-blue'
                         style={{ backgroundImage: 'url(' + url + ')' }} />

                </div>
                <UtilitiesModal />
            </div>
        )
    }
}

LoginContainer.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    login: PropTypes.func.isRequired
}

export default connect((state) => {
    return {
        ...state.auth.authentication
    }
}, { login: login, show: show })(LoginContainer)
