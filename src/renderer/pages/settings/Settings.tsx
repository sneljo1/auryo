import { restartApp } from '@common/store/actions';
import { isAuthenticatedSelector } from '@common/store/selectors';
import PageHeader from '@renderer/_shared/PageHeader/PageHeader';
import React, { FC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AdvancedSettings } from './components/sections/AdvancedSettings';
import { MainSettings } from './components/sections/MainSettings';
import './Settings.scss';

export const Settings: FC = () => {
  const dispatch = useDispatch();
  const authenticated = useSelector(isAuthenticatedSelector);
  const [shouldRestart, setShouldRestart] = useState(false);

  const restart = useCallback(() => dispatch(restartApp()), [dispatch]);

  const showRestart = useCallback(() => setShouldRestart(true), []);

  return (
    <>
      <PageHeader title="Settings" />

      <div className="settingsWrapper">
        {authenticated && (
          <div className="donationBox">
            <div className="iconWrapper">
              <i className="bx bxs-heart" />
            </div>
            <div>
              <strong>Are you enjoying this app as much as I am? Or even more?</strong>
              <div>
                I would love to spend more time on this, and other open-source projects. I do not earn anything off this
                project, so I would highly appreciate any financial contribution towards this goal.
                <a href="https://github.com/sponsors/Superjo149">Contribute now</a>
              </div>
            </div>
          </div>
        )}

        <>
          {shouldRestart && (
            <div className="info-message">
              A{' '}
              <a href="javascript:void(0)" onClick={restart}>
                restart
              </a>{' '}
              is required to enable/disable this feature.
            </div>
          )}

          <MainSettings onShouldRestart={showRestart} />
          <AdvancedSettings />
        </>
      </div>
    </>
  );
};
