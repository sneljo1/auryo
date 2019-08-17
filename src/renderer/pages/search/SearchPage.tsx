import { StoreState } from "@common/store";
import { toggleFollowing } from "@common/store/auth";
import { canFetchMoreOf, fetchMore, ObjectState, ObjectTypes, PlaylistTypes } from "@common/store/objects";
import { search } from "@common/store/objects/playlists/search/actions";
import { getPlaylistName, getPlaylistObjectSelector } from "@common/store/objects/selectors";
import { playTrack } from "@common/store/player";
import * as React from "react";
import { connect, MapDispatchToProps, MapStateToPropsParam } from "react-redux";
import { RouteComponentProps } from "react-router";
import { bindActionCreators } from "redux";
import { NormalizedResult } from "../../../types";
import Spinner from "../../_shared/Spinner/Spinner";
import TracksGrid from "../../_shared/TracksGrid/TracksGrid";
import "./SearchPage.scss";
import SearchWrapper from "./SearchWrapper";

interface OwnProps extends RouteComponentProps {
}

interface PropsFromState {
    playlist: ObjectState<NormalizedResult> | null;
    objectId: string;
    query: string;
}

interface PropsFromDispatch {
    search: typeof search;
    canFetchMoreOf: typeof canFetchMoreOf;
    fetchMore: typeof fetchMore;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class Search extends React.Component<AllProps> {

    public componentDidMount() {
        const { query, search, playlist, objectId } = this.props;

        if (!playlist && query && query.length) {
            search({ query }, objectId, 15);
        }
    }

    public componentDidUpdate(prevProps: AllProps) {
        const { query, search, playlist, objectId } = this.props;

        if ((query !== prevProps.query || !playlist) && query && query.length) {
            search({ query }, objectId, 15);
        }
    }

    public hasMore = () => {
        const { canFetchMoreOf, objectId } = this.props;

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any;
    }

    public loadMore = () => {
        const { canFetchMoreOf, fetchMore, objectId } = this.props;

        if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS);
        }
    }

    public renderContent() {
        const {
            playlist,
            objectId,
            query
        } = this.props;

        if (query === "" || (playlist && !playlist.items.length && !playlist.isFetching)) {
            return (
                <div className="pt-5 mt-5">
                    <h5 className="text-muted text-center">{query ? `No results for "${query}"` : "Search for people, tracks and albums"}</h5>
                    <div className="text-center" style={{ fontSize: "5rem" }}>
                        {query ? "😭" : "🕵️‍"}
                    </div>
                </div>
            );
        }

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <Spinner contained={true} />
            );
        }

        return (
            <div>
                <TracksGrid
                    items={playlist.items}
                    objectId={objectId}

                    isItemLoaded={(index) => !!playlist.items[index]}
                    loadMore={this.loadMore as any}
                    hasMore={this.hasMore()}
                />

                {
                    playlist && playlist.isFetching && <Spinner />
                }
            </div>
        );
    }

    public render() {
        const { query, location } = this.props;

        return (
            <SearchWrapper
                location={location}
                query={query}
            >
                {this.renderContent()}
            </SearchWrapper>
        );
    }
}

const mapStateToProps: MapStateToPropsParam<PropsFromState, OwnProps, StoreState> = (state, props) => {
    const { location: { search: rawSearch } } = props;

    const query: string = decodeURI(rawSearch.replace("?", ""));

    const objectId = getPlaylistName(query, PlaylistTypes.SEARCH);

    return {
        query,
        playlist: getPlaylistObjectSelector(objectId)(state),
        objectId,
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
    toggleFollowing,
    playTrack,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(Search);
