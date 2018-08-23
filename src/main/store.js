import { ipcMain } from 'electron';
import { applyMiddleware, compose, createStore } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import thunk from 'redux-thunk';
import rootReducer from '../shared/reducers';

const enhancer = compose(
    applyMiddleware(thunk),
    electronEnhancer()
)

const configureStore = () => {
    const store = createStore(rootReducer, enhancer)

    ipcMain.on('renderer-reload', (event) => {
        delete require.cache[require.resolve('../shared/reducers')]
        store.replaceReducer(require('../shared/reducers')) // eslint-disable-line global-require
        event.returnValue = true // eslint-disable-line no-param-reassign
    })

    return store
}

export { configureStore };
