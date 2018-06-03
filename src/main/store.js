import { applyMiddleware, compose, createStore } from 'redux'
import { electronEnhancer } from 'redux-electron-store'
import { ipcMain } from 'electron'
import rootReducer from '../shared/reducers'
import thunk from 'redux-thunk'

let enhancer = compose(
    applyMiddleware(thunk),
    electronEnhancer()
)

const configureStore = () => {
    const store = createStore(rootReducer, enhancer)

    ipcMain.on('renderer-reload', (event, action) => {
        delete require.cache[require.resolve('../shared/reducers')]
        store.replaceReducer(require('../shared/reducers'))
        event.returnValue = true
    })

    return store
}

export  { configureStore }