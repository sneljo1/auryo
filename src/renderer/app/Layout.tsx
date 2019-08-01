import { Intent, IResizeEntry, IToastOptions, Position, ResizeSensor } from "@blueprintjs/core";
import { EVENTS } from "@common/constants/events";
import { StoreState } from "@common/store";
import { AppState, initApp, setDimensions, stopWatchers, toggleOffline } from "@common/store/app";
import { getUserPlaylists } from "@common/store/auth/selectors";
import { PlayingTrack } from "@common/store/player";
import { addToast, clearToasts, removeToast } from "@common/store/ui";
import cn from "classnames";
import { ipcRenderer } from "electron";
import * as is from "electron-is";
import { debounce } from "lodash";
import * as React from "react";
import Theme from "react-custom-properties";
import { connect, MapDispatchToProps } from "react-redux";
import { bindActionCreators } from "redux";
import { NormalizedResult } from "../../types";
import ErrorBoundary from "../_shared/ErrorBoundary";
import Spinner from "../_shared/Spinner/Spinner";
import AppError from "./components/AppError/AppError";
import AboutModal from "./components/modals/AboutModal/AboutModal";
import ChangelogModal from "./components/modals/ChangeLogModal/ChangelogModal";
import Player from "./components/player/Player";
import Queue from "./components/Queue/Queue";
import SideBar from "./components/Sidebar/Sidebar";
import { Themes } from "./components/Theme/themes";
import Toastr from "./components/Toastr";

interface PropsFromState {
    toasts: IToastOptions[];
    playingTrack: PlayingTrack | null;
    app: AppState;
    theme: string;
    userPlayerlists: NormalizedResult[];
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

    private readonly debouncedHandleResize: any;

    constructor(props: AllProps) {
        super(props);

        this.debouncedHandleResize = debounce(this.handleResize, 500, { leading: true });
    }

    public componentDidMount() {
        const { initApp } = this.props;

        initApp();

        window.addEventListener("online", this.setOnlineStatus);
        window.addEventListener("offline", this.setOnlineStatus);

    }

    public componentDidUpdate(prevProps: AllProps) {
        const { app, addToast, removeToast } = this.props;

        if (app.offline !== prevProps.app.offline && app.offline === true) {
            addToast({
                key: "offline",
                intent: Intent.PRIMARY,
                message: "You are currently offline."
            });
        } else if (app.offline !== prevProps.app.offline && app.offline === false) {
            removeToast("offline");
        }
    }

    public componentWillUnmount() {

        stopWatchers();

        window.removeEventListener("online", this.setOnlineStatus);
        window.removeEventListener("offline", this.setOnlineStatus);
    }

    public setOnlineStatus = () => {
        const { toggleOffline } = this.props;

        toggleOffline(!navigator.onLine);
    }

    public handleResize = ([{ contentRect: { width, height } }]: IResizeEntry[]) => {

        const { setDimensions } = this.props;

        setDimensions({
            height,
            width
        });
    }

    public render() {
        const {
            // Vars
            app,
            playingTrack,
            children,
            theme,
            // Functions
            toasts,
            clearToasts,
            userPlayerlists
        } = this.props;

        return (
            <ResizeSensor
                onResize={this.debouncedHandleResize}
            >
                <Theme
                    global={true}
                    properties={Themes[theme]}
                >
                    <div
                        className={cn("body auryo", {
                            development: !(process.env.NODE_ENV === "production"),
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
                                    reload={() => {
                                        ipcRenderer.send(EVENTS.APP.RELOAD)
                                    }}
                                />
                            ) : null
                        }

                        <main
                            className={cn("d-flex flex-nowrap", {
                                playing: playingTrack
                            })}
                        >
                            <SideBar items={userPlayerlists} />

                            <Queue />

                            <section className="content">
                                <Toastr
                                    position={Position.TOP_RIGHT}
                                    toasts={toasts}
                                    clearToasts={clearToasts}
                                />

                                <div className="f-height">
                                    <ErrorBoundary>
                                        {children}
                                    </ErrorBoundary>
                                </div>
                            </section>
                        </main>

                        <footer className="fixed-bottom player-container">
                            <Player />
                        </footer>

                        {/* Register Modals */}

                        <AboutModal />
                        <ChangelogModal />

                    </div>
                </Theme>
            </ResizeSensor>
        );
    }
}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { app, config, player, ui } = state;

    return {
        userPlayerlists: getUserPlaylists(state),
        playingTrack: player.playingTrack,
        app,
        theme: config.app.theme,
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
