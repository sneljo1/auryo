import cn from 'classnames';
import React, { FC, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

export const HistoryNavigation: FC = () => {
  const history = useHistory();

  const canGoBack = (history as any).canGo(-1);
  const canGoForward = (history as any).canGo(1);

  const goBack = useCallback(() => {
    if (canGoBack) {
      history.goBack();
    }
  }, [canGoBack, history]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      history.goForward();
    }
  }, [canGoForward, history]);

  return (
    <div className="control-nav">
      <div className="control-nav-inner flex">
        <a className={cn({ disabled: !canGoBack })} href="javascript:void(0)" onClick={goBack}>
          <i className="bx bx-chevron-left" />
        </a>
        <a className={cn({ disabled: !canGoForward })} href="javascript:void(0)" onClick={goForward}>
          <i className="bx bx-chevron-right" />
        </a>
      </div>
    </div>
  );
};
