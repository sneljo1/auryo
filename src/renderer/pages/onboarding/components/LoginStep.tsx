import logo from '@assets/img/auryo-dark.png';
import { Button } from '@blueprintjs/core';
import SettingsModal from '@renderer/app/components/modals/SettingsModal/SettingsModal';
import React from 'react';
import * as reduxModal from 'redux-modal';

interface Props {
  error: string | null;
  show: typeof reduxModal.show;
  loading: boolean;
  login(): void;
}

export const LoginStep = React.memo<Props>(({ error, login, show, loading }) => (
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
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <strong className="d-block mb-2">Login using SoundCloud</strong>

      <Button className="block" color="primary" loading={loading} onClick={login}>
        Login
      </Button>

      <a
        href="javascript:void(0)"
        className="settings btn btn-link mt-1 btn-block"
        onClick={() => {
          show('settings', {});
        }}>
        Settings
      </a>
    </div>

    <SettingsModal />
  </>
));
