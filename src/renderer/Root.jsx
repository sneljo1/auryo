import React from 'react'
import { Provider } from 'react-redux'
import { windowRouter } from '../shared/utils/router'
import { EVENTS } from '../shared/constants/events'
import { ConnectedRouter } from 'react-router-redux'
import Routes from './routes'

class Root extends React.Component {

    componentDidMount() {
        windowRouter.send(EVENTS.APP.READY)
        this.props.history.listen(loc => {
            windowRouter.send('GO')
        })
    }

    render() {
        const { store, history } = this.props

        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Routes store={store} />
                </ConnectedRouter>
            </Provider>

        )
    }
}

export default Root