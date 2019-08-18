import { StoreState } from "@common/store";
import { toggleFollowing } from "@common/store/auth";
import { canFetchMoreOf, fetchMore, ObjectState, ObjectTypes, PlaylistTypes } from "@common/store/objects";
import { search } from "@common/store/objects/playlists/search/actions";
import { getPlaylistName, getPlaylistObjectSelector } from "@common/store/objects/selectors";
import { playTrack } from "@common/store/player";
import * as React from "react";
import { connect, MapDispatchToProps, MapStateToPropsParam } from "react-redux";
import { RouteComponentProps } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import { NormalizedResult } from "../../../types";
import Spinner from "../../_shared/Spinner/Spinner";
import TracksGrid from "../../_shared/TracksGrid/TracksGrid";
import "./SearchPage.scss";
import SearchWrapper from "./SearchWrapper";

interface OwnProps extends RouteComponentProps {
}


type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

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

    public renderContent() {
        const {
            playlist,
            objectId,
            query,
            canFetchMoreOf,
            fetchMore
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
                    isLoading={playlist.isFetching}
                    isItemLoaded={(index) => !!playlist.items[index]}
                    loadMore={() => {
                        return fetchMore(objectId, ObjectTypes.PLAYLISTS) as any
                    }}
                    hasMore={canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any}
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

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { location: { search: rawSearch } } = props;

    const query: string = decodeURI(rawSearch.replace("?", ""));

    const objectId = getPlaylistName(query, PlaylistTypes.SEARCH);

    return {
        query,
        playlist: getPlaylistObjectSelector(objectId)(state),
        objectId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
    toggleFollowing,
    playTrack,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(Search);
