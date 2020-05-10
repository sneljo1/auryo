import { Button } from '@blueprintjs/core';
import React from 'react';

interface Props {
  onNext(): void;
}

const LIMIT = 15000;

export const WelcomeStep = React.memo<Props>(({ onNext }) => (
  <>
    <h1 className="animated fadeInLeft faster first">⚠️ A heads-up</h1>
    <div className="sub-title animated fadeInLeft faster second">
      Due to the limitations from the SoundCloud APIs, we are limited to{' '}
      <strong className="text-primary">{LIMIT.toLocaleString()} streams/day</strong>. After this, there will be a
      waiting period where no music can be listened to. You may also notice that some music may not be available in the
      desktop version because every song owner has the option to disable access for third party applications such as
      this one.
    </div>

    <div className="login_section  animated fadeInLeft faster third">
      <Button color="primary" onClick={onNext}>
        <i className="bx bx-arrow-back bx-rotate-180" />
      </Button>
    </div>
  </>
));
