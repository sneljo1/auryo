import feetonmusicbox from '@assets/img/feetonmusicbox.jpg';
import { Position } from '@blueprintjs/core';
import * as actions from '@common/store/actions';
import AboutModal from '@renderer/app/components/modals/AboutModal/AboutModal';
import { Toastr } from '@renderer/app/components/Toastr';
import cn from 'classnames';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoginStep } from './components/LoginStep';
import { PrivacyStep } from './components/PrivacyStep';
import { WelcomeStep } from './components/WelcomeStep';
import './OnBoarding.scss';

type Steps = 'welcome' | 'login' | 'privacy';

type Props = RouteComponentProps<{ step?: Steps }>;

export const OnBoarding: FC<Props> = ({
  match: {
    params: { step: initialStep }
  }
}) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState<Steps>(initialStep ?? 'login');

  const finish = useCallback(() => {
    dispatch(actions.finishOnboarding());
  }, [dispatch]);

  useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    }
  }, [initialStep]);

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
          {step === 'login' && <LoginStep />}

          {step === 'welcome' && (
            <WelcomeStep
              onNext={() => {
                setStep('privacy');
              }}
            />
          )}

          {step === 'privacy' && <PrivacyStep onNext={finish} />}
        </div>
      </div>
      <AboutModal />
      <Toastr position={Position.TOP_RIGHT} />
    </div>
  );
};
