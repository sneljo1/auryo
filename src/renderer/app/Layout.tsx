import { Intent, IResizeEntry, Position, ResizeSensor } from "@blueprintjs/core";
import { EVENTS } from "@common/constants/events";
import { StoreState } from "@common/store";
import { initApp, setDimensions, stopWatchers, toggleOffline } from "@common/store/app";
import { getUserPlaylists } from "@common/store/auth/selectors";
import { PlayerStatus } from "@common/store/player";
import { getCurrentPlaylistId } from "@common/store/player/selectors";
import { addToast, clearToasts, removeToast, setScrollPosition } from "@common/store/ui";
import { getPreviousScrollTop } from "@common/store/ui/selectors";
import { ContentContext, LayoutSettings } from "@renderer/_shared/context/contentContext";
import cn from "classnames";
import { autobind } from "core-decorators";
import { ipcRenderer } from "electron";
import * as is from "electron-is";
import { UnregisterCallback } from "history";
import { debounce } from "lodash";
import * as React from "react";
import Theme from "react-custom-properties";
import Scrollbars from "react-custom-scrollbars";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { FixedSizeList } from "react-window";
import { bindActionCreators, compose, Dispatch } from "redux";
import ErrorBoundary from "../_shared/ErrorBoundary";
import Spinner from "../_shared/Spinner/Spinner";
import AppError from "./components/AppError/AppError";
import AboutModal from "./components/modals/AboutModal/AboutModal";
import ChangelogModal from "./components/modals/ChangeLogModal/ChangelogModal";
import Player from "./components/player/Player";
import SideBar from "./components/Sidebar/Sidebar";
import { Themes } from "./components/Theme/themes";
import Toastr from "./components/Toastr";

interface State {
    isScrolling: boolean;
    settings: LayoutSettings;
    getList?(): FixedSizeList | null;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = PropsFromState & PropsFromDispatch & RouteComponentProps;

export const INITIAL_LAYOUT_SETTINGS: LayoutSettings = {
    hasImage: false,
}

@autobind
class Layout extends React.Component<AllProps, State> {

    public state: State = {
        settings: INITIAL_LAYOUT_SETTINGS,
        isScrolling: false,
    }

    private readonly contentRef: React.RefObject<Scrollbars> = React.createRef();
    private readonly debouncedHandleResize: (entries: IResizeEntry[]) => void;
    private readonly debouncedSetScrollPosition: (scrollTop: number, pathname: string) => any;
    private unregister?: UnregisterCallback;
    private unmounted: boolean = false;

    constructor(props: AllProps) {
        super(props);

        this.debouncedHandleResize = debounce(this.handleResize, 500, { leading: true });
        this.debouncedSetScrollPosition = debounce(props.setScrollPosition, 100);
    }

    public componentDidMount() {
        window.addEventListener("online", this.setOnlineStatus);
        window.addEventListener("offline", this.setOnlineStatus);

        this.handlePreviousScrollPositionOnBack();

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

        this.unmounted = true;

        if (this.unregister) {
            this.unregister();
        }
    }

    // tslint:disable-next-line: max-func-body-length
    public render() {
        const {
            // Vars
            app,
            playingTrack,
            children,
            theme,
            currentPlaylistId,
            isActuallyPlaying,
            // Functions
            toasts,
            clearToasts,
            userPlayerlists,

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
                            className={cn({
                                playing: playingTrack
                            })}
                        >
                            <SideBar
                                items={userPlayerlists}
                                isActuallyPlaying={isActuallyPlaying}
                                currentPlaylistId={currentPlaylistId}
                            />

                            <ContentContext.Provider
                                value={{
                                    settings: this.state.settings,
                                    list: this.state.getList,
                                    setList: (getList) => this.setState({ getList }),
                                    applySettings: (newSettings) => this.setState(({ settings }) => ({ settings: { ...settings, ...newSettings } }))
                                }}
                            >

                                <Scrollbars
                                    className="content"
                                    ref={this.contentRef}
                                    onScroll={this.handleScroll as any}
                                    renderTrackHorizontal={props => <div></div>}
                                    renderTrackVertical={props => <div {...props} className="track-vertical" />}
                                    renderThumbHorizontal={props => <div></div>}
                                    renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
                                >
                                    <Toastr
                                        position={Position.TOP_RIGHT}
                                        toasts={toasts}
                                        clearToasts={clearToasts}
                                    />

                                    <ErrorBoundary>
                                        {children}
                                    </ErrorBoundary>
                                </Scrollbars>
                            </ContentContext.Provider>


                            <Player />
                        </main>

                        {/* Register Modals */}

                        <AboutModal />
                        <ChangelogModal />

                    </div>
                </Theme>
            </ResizeSensor>
        );
    }

    private setOnlineStatus() {
        const { toggleOffline } = this.props;

        toggleOffline(!navigator.onLine);
    }

    private handleResize([{ contentRect: { width, height } }]: IResizeEntry[]) {

        const { setDimensions } = this.props;

        setDimensions({
            height,
            width
        });
    }

    private handleScroll(e: React.ChangeEvent<HTMLDivElement>) {
        const scrollTop = e.target.scrollTop;

        if (this.state.getList) {
            const list = this.state.getList();

            if (list) {
                list.scrollTo(scrollTop)
            }
        }

        this.debouncedSetScrollPosition(scrollTop, this.props.location.pathname);
    }

    private handlePreviousScrollPositionOnBack() {

        this.unregister = this.props.history.listen((_location, action) => {

            if (!this.state.isScrolling) {

                const scrollTo = action === "POP" ? this.props.previousScrollTop : 0;

                this.setState({
                    isScrolling: true
                }, () => {
                    requestAnimationFrame(() => {
                        // Scroll content to correct place
                        if (this.contentRef.current) {
                            this.contentRef.current.scrollTop(scrollTo);
                        }

                        this.setState({
                            isScrolling: false
                        })
                    })
                })

            }
        });
    }
}

const mapStateToProps = (state: StoreState) => {
    const { app, config, player, ui } = state;


    return {
        userPlayerlists: getUserPlaylists(state),
        playingTrack: player.playingTrack,
        app,
        theme: config.app.theme,
        toasts: ui.toasts,
        previousScrollTop: getPreviousScrollTop(state) || 0,
        currentPlaylistId: getCurrentPlaylistId(state),
        isActuallyPlaying: status === PlayerStatus.PLAYING,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    addToast,
    clearToasts,
    initApp,
    removeToast,
    setDimensions,
    toggleOffline,
    setScrollPosition,
}, dispatch);

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Layout);
