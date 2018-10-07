import { createSelector } from 'reselect';
import { StoreState } from '..';
import { getRouter } from '../selector';

export const getUi = (state: StoreState) => state.ui;

export const getPreviousScrollTop = createSelector(
    getUi,
    getRouter,
    (ui, router) => {
        return router.action === 'POP' ? ui.scrollPosition[router.location.pathname] : undefined;
    }
);
