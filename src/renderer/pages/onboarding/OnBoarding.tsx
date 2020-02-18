import feetonmusicbox from '@assets/img/feetonmusicbox.jpg';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { authConfigSelector, configSelector } from '@common/store/config/selectors';
import AboutModal from '@renderer/app/components/modals/AboutModal/AboutModal';
import cn from 'classnames';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import * as ReduxModal from 'redux-modal';
import { LoginStep } from './components/LoginStep';
import { PrivacyStep } from './components/PrivacyStep';
import { WelcomeStep } from './components/WelcomeStep';
import './OnBoarding.scss';
import { Position } from '@blueprintjs/core';
import { Toastr } from '@renderer/app/components/Toastr';
import { EVENTS } from '@common/constants';

const mapStateToProps = (state: StoreState) => ({
  ...state.auth.authentication,
  config: configSelector(state),
  auth: authConfigSelector(state),
  toasts: state.ui.toasts
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      show: ReduxModal.show,
      setConfigKey: actions.setConfigKey,
      clearToasts: actions.clearToasts
    },
    dispatch
  );

type OwnProps = RouteComponentProps;

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch & RouteComponentProps;

const OnBoarding: FC<AllProps> = ({ loading, error, show, config, setConfigKey, history, toasts, clearToasts }) => {
  const [step, setStep] = useState<'welcome' | 'login' | 'privacy'>('login');

  const {
    auth: { token },
    lastLogin
  } = config;

  useEffect(() => {
    if (token) {
      if (lastLogin) {
        history.replace('/');
      } else {
        setStep('welcome');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lastLogin]);

  const login = () => {
    if (!loading) {
      ipcRenderer.send(EVENTS.APP.AUTH.LOGIN);
    }
  };

  return (
    <div id="login" className={cn('login', { login_small: step === 'login' })}>
      <div className="login_svg">
        <svg preserveAspectRatio="xMinYMin meet" viewBox="442.89 75.141 1923 1204.859">
          <defs>
            <pattern id="image" x="0" y="0" width="1" height="1">
              <image xlinkHref={feetonmusicbox} width="1923" height="1204.859" preserveAspectRatio="none" />
            </pattern>
          </defs>
          <path
            // tslint:disable-next-line:max-line-length
            d=" M 1492.89 76.729 C 1494.781 76.669 1491.009 76.751 1492.89 76.729 Q 1688.207 74.452 1819.89 350.603 Q 1816.865 344.209 1819.89 350.603 Q 2002.369 736.338 2358.89 777.603 L 2365.89 1279.999 Q 442.89 1280.001 442.89 1279.999 C 446.431 1068.715 588.71 855.833 711.652 708.742 C 804.759 575.761 875.829 694.161 930.09 515.844 Q 932.515 507.875 934.89 499.603 Q 934.805 500.031 934.89 499.603 Q 1024.781 49.177 1492.89 76.729"
            fill="url(#image)"
          />
        </svg>
      </div>

      <div className="row d-flex align-items-center">
        <div className={`login-wrap col-12 ${step !== 'login' ? 'col-md-6' : 'col-md-5'}`}>
          {step === 'login' && <LoginStep loading={loading} error={error} show={show} login={login} />}

          {step === 'welcome' && (
            <WelcomeStep
              onNext={() => {
                setStep('privacy');
              }}
            />
          )}

          {step === 'privacy' && (
            <PrivacyStep
              config={config}
              setConfigKey={setConfigKey}
              onNext={() => {
                setConfigKey('lastLogin', Date.now());
                history.replace('/');
              }}
            />
          )}
        </div>
      </div>
      <AboutModal />
      <Toastr position={Position.TOP_RIGHT} toasts={toasts} clearToasts={clearToasts} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(OnBoarding);
