import logo from '@assets/img/auryo-dark.png';
import { Button } from '@blueprintjs/core';
import { getAppAuth } from '@common/store/selectors';
import * as actions from '@common/store/actions';
import SettingsModal from '@renderer/app/components/modals/SettingsModal/SettingsModal';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as reduxModal from 'redux-modal';

export const LoginStep: FC = () => {
  const dispatch = useDispatch();
  const { isLoading, error, isError } = useSelector(getAppAuth);
  const login = useCallback(() => {
    if (!isLoading) {
      dispatch(actions.login.request({}));
    }
  }, [dispatch, isLoading]);

  return (
    <>
      <div className="login-img-wrap animated fadeInLeft faster first">
        <img className="img-fluid" src={logo} alt="login" />
      </div>
      <div className="sub-title animated fadeInLeft faster second">
        A SoundCloud client for your desktop. This project is open-source, so consider{' '}
        <a href="https://github.com/Superjo149/auryo">contributing</a> or becoming{' '}
        <a href="https://github.com/sponsors/Superjo149">a financial backer</a>. But most of all, enjoy the music. 🎉
      </div>

      <div className="login_section animated fadeInLeft faster third">
        {isError ? (
          <div className="alert alert-danger">{error ?? 'Something went wrong during login, please try again'}</div>
        ) : null}

        <strong className="d-block mb-2">Login using SoundCloud</strong>

        <Button className="block" color="primary" loading={isLoading} onClick={login}>
          Login
        </Button>

        <a
          href="javascript:void(0)"
          className="settings btn btn-link mt-1 btn-block"
          onClick={() => {
            dispatch(reduxModal.show('settings', {}));
          }}>
          Settings
        </a>
      </div>

      <SettingsModal />
    </>
  );
};
