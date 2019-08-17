import { StoreState } from "@common/store";
import { canFetchMoreOf, fetchMore, ObjectTypes, PlaylistTypes } from "@common/store/objects";
import { search } from "@common/store/objects/playlists/search/actions";
import { getPlaylistName, getPlaylistObjectSelector } from "@common/store/objects/selectors";
import cn from "classnames";
import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { NavLink, RouteComponentProps } from "react-router-dom";
import { Nav } from "reactstrap";
import { bindActionCreators, Dispatch } from "redux";
import PageHeader from "../../_shared/PageHeader/PageHeader";
import Spinner from "../../_shared/Spinner/Spinner";
import TracksGrid from "../../_shared/TracksGrid/TracksGrid";

interface OwnProps extends RouteComponentProps<{ tag: string, type: string }> {
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
}

enum TabTypes {
    TRACKS = "TRACKS",
    PLAYLISTS = "PLAYLISTS"
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

@autobind
class TagsPage extends React.Component<AllProps, State> {

    public componentDidMount() {
        const { tag, playlist, objectId, search } = this.props;

        if (!playlist && tag && tag.length) {
            search({ tag }, objectId, 25);
        }
    }

    public componentDidUpdate(prevProps: AllProps) {
        const { tag, playlist, objectId, search, showType } = this.props;

        if ((tag !== prevProps.tag || !playlist) && tag && tag.length || showType !== prevProps.showType) {
            search({ tag }, objectId, 25);
        }
    }

    public hasMore(): boolean {
        const { objectId, canFetchMoreOf } = this.props;

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any;
    }

    public async loadMore() {
        const { objectId, fetchMore, canFetchMoreOf } = this.props;

        try {
            if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
                return fetchMore(objectId, ObjectTypes.PLAYLISTS);
            }

            return null;

        } catch (err) {
            throw err;
        }
    }

    public render() {
        const {
            objectId,
            playlist,
            showType,
            tag,
        } = this.props;

        return (
            <>

                <PageHeader
                    title={tag}
                    subtitle={`Most popular ${showType === TabTypes.TRACKS ? "tracks" : "playlists"}`}
                />

                <div className="container-fluid charts">
                    <Nav className="tabs" tabs={true}>
                        <NavLink
                            className={cn("nav-link", { active: showType === TabTypes.TRACKS })}
                            to={`/tags/${tag}/${TabTypes.TRACKS}`}
                            activeClassName="active"
                        >
                            Tracks
                        </NavLink>

                        <NavLink
                            className={cn("nav-link", { active: showType === TabTypes.PLAYLISTS })}
                            activeClassName="active"
                            to={`/tags/${tag}/${TabTypes.PLAYLISTS}`}
                        >
                            Playlists
                        </NavLink>
                    </Nav>
                </div>

                {
                    !playlist || (playlist && !playlist.items.length && playlist.isFetching) ? (
                        <Spinner />
                    ) : (
                            <TracksGrid
                                items={playlist.items}
                                objectId={objectId}
                                hasMore={this.hasMore()}
                                loadMore={() => this.loadMore() as any}
                                isLoading={playlist.isFetching}
                                isItemLoaded={index => !!playlist.items[index]}
                            />
                        )
                }


            </>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { match: { params: { tag, type } } } = props;

    const showType = (type as TabTypes) || TabTypes.TRACKS;

    const objectId = getPlaylistName(tag, showType === TabTypes.TRACKS ? PlaylistTypes.SEARCH_TRACK : PlaylistTypes.SEARCH_PLAYLIST);

    return {
        objectId,
        playlist: getPlaylistObjectSelector(objectId)(state),
        tag,
        showType,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TagsPage);
