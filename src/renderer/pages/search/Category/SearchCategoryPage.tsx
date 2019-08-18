import { StoreState } from "@common/store";
import { canFetchMoreOf, fetchMore, ObjectTypes, PlaylistTypes } from "@common/store/objects";
import { search } from "@common/store/objects/playlists/search/actions";
import { getPlaylistName, getPlaylistObjectSelector } from "@common/store/objects/selectors";
import { getPreviousScrollTop } from "@common/store/ui/selectors";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import Spinner from "../../../_shared/Spinner/Spinner";
import TracksGrid from "../../../_shared/TracksGrid/TracksGrid";
import SearchWrapper from "../SearchWrapper";

interface OwnProps extends RouteComponentProps<{
    category: "user" | "playlist" | "track";
}> {

}


type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class SearchCategory extends React.Component<AllProps> {

    public componentDidMount() {
        const { query, playlist, objectId, search } = this.props;

        if (!playlist && query && query.length) {
            search({ query }, objectId, 25);
        }
    }

    public componentDidUpdate(prevProps: AllProps) {
        const { query, playlist, objectId, search } = this.props;

        if ((query !== prevProps.query || !playlist) && query && query.length) {
            search({ query }, objectId, 25);
        }
    }

    public render() {
        const {
            objectId,
            playlist,
            location,
            query,
        } = this.props;

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <Spinner contained={true} />
            );
        }

        return (
            <SearchWrapper
                location={location}
                query={query}
            >
                <TracksGrid
                    items={playlist.items}
                    objectId={objectId}
                    isLoading={playlist.isFetching}
                    hasMore={canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any}
                    loadMore={() => {
                        return fetchMore(objectId, ObjectTypes.PLAYLISTS) as any;
                    }}
                />
            </SearchWrapper>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { match: { params: { category } }, location: { search: rawSearch } } = props;

    const query: string = decodeURI(rawSearch.replace("?", ""));

    let objectId: string = "";

    switch (category) {
        case "user":
            objectId = getPlaylistName(query, PlaylistTypes.SEARCH_USER);
            break;
        case "playlist":
            objectId = getPlaylistName(query, PlaylistTypes.SEARCH_PLAYLIST);
            break;
        case "track":
            objectId = getPlaylistName(query, PlaylistTypes.SEARCH_TRACK);
            break;
        default:
    }

    return {
        objectId,
        playlist: getPlaylistObjectSelector(objectId)(state),
        query,
        previousScrollTop: getPreviousScrollTop(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(SearchCategory);
