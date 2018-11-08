import { Intent, IResizeEntry, IToastOptions, ResizeSensor, Position } from '@blueprintjs/core';
import cn from 'classnames';
import * as is from 'electron-is';
import { debounce } from 'lodash';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { StoreState } from '../../common/store';
import { AppState, initApp, setDimensions, stopWatchers, toggleOffline } from '../../common/store/app';
import { getUserPlaylists } from '../../common/store/auth/selectors';
import { PlayingTrack } from '../../common/store/player';
import { addToast, clearToasts, removeToast } from '../../common/store/ui';
import { NormalizedResult } from '../../types';
import ErrorBoundary from '../_shared/ErrorBoundary';
import Spinner from '../_shared/Spinner/Spinner';
import AppError from './components/AppError/AppError';
import ChangelogModal from './components/modals/ChangeLogModal/ChangelogModal';
import UtilitiesModal from './components/modals/UtilitiesModel/UtilitiesModal';
import Player from './components/player/Player';
import Queue from './components/Queue/Queue';
import SideBar from './components/Sidebar/Sidebar';
import Toastr from './components/Toastr';

interface PropsFromState {
    toasts: Array<IToastOptions>;
    playingTrack: PlayingTrack | null;
    app: AppState;

    userPlayerlists: Array<NormalizedResult>;
}

interface PropsFromDispatch {
    initApp: typeof initApp;
    toggleOffline: typeof toggleOffline;
    addToast: typeof addToast;
    clearToasts: typeof clearToasts;
    removeToast: typeof removeToast;
    setDimensions: typeof setDimensions;
}

type AllProps = PropsFromState & PropsFromDispatch;

class Layout extends React.Component<AllProps> {

    private debouncedHandleResize: any;

    constructor(props: AllProps) {
        super(props);

        this.debouncedHandleResize = debounce(this.handleResize, 500, { leading: true });
    }

    componentDidMount() {
        const { initApp } = this.props;

        initApp();

        window.addEventListener('online', this.setOnlineStatus);
        window.addEventListener('offline', this.setOnlineStatus);

    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { app, addToast, removeToast } = this.props;

        if (app.offline !== nextProps.app.offline && nextProps.app.offline === true) {
            addToast({
                key: 'offline',
                intent: Intent.PRIMARY,
                message: 'You are currently offline.'
            });
        } else if (app.offline !== nextProps.app.offline && nextProps.app.offline === false) {
            removeToast('offline');
        }
    }

    componentWillUnmount() {

        stopWatchers();

        window.removeEventListener('online', this.setOnlineStatus);
        window.removeEventListener('offline', this.setOnlineStatus);
    }

    setOnlineStatus = () => {
        const { toggleOffline } = this.props;

        toggleOffline(!navigator.onLine);
    }

    handleResize = ([{ contentRect: { width, height } }]: Array<IResizeEntry>) => {

        const { setDimensions } = this.props;

        setDimensions({
            height,
            width
        });
    }

    render() {
        const {
            // Vars
            app,
            playingTrack,
            children,
            // Functions
            initApp,
            toasts,
            clearToasts,
            userPlayerlists
        } = this.props;

        return (
            <ResizeSensor
                onResize={this.debouncedHandleResize}
            >

                <div
                    className={cn('body auryo', {
                        development: !(process.env.NODE_ENV === 'production'),
                        mac: is.osx(),
                        playing: !!playingTrack
                    })}
                >
                    {
                        !app.loaded && !app.offline && !app.loading_error ? (
                            <Spinner full={true} />
                        ) : null
                    }

                    {
                        app.loading_error ? (
                            <AppError
                                error={app.loading_error}
                                initApp={initApp}
                            />
                        ) : null
                    }

                    <main
                        className={cn('d-flex flex-nowrap', {
                            playing: playingTrack
                        })}
                    >
                        <SideBar items={userPlayerlists} />

                        <Queue />

                        <section className='content'>
                            <Toastr
                                position={Position.TOP_RIGHT}
                                toasts={toasts}
                                clearToasts={clearToasts}
                            />

                            <div className='f-height'>
                                <ErrorBoundary
                                    initApp={initApp}
                                >
                                    {children}
                                </ErrorBoundary>
                            </div>
                        </section>
                    </main>

                    <footer className='fixed-bottom player-container'>
                        <Player />
                    </footer>

                    {/* Register Modals */}

                    <UtilitiesModal />
                    <ChangelogModal />

                </div>
            </ResizeSensor>
        );
    }
}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { app, player, ui } = state;

    return {
        userPlayerlists: getUserPlaylists(state),
        playingTrack: player.playingTrack,
        app,
        toasts: ui.toasts,
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, {}> = (dispatch) => bindActionCreators({
    addToast,
    clearToasts,
    initApp,
    removeToast,
    setDimensions,
    toggleOffline,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
