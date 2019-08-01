import { StoreState } from "@common/store";
import { fetchPersonalizedPlaylistsIfNeeded } from "@common/store/auth";
import * as cn from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import { SoundCloud } from "../../../types";
import Spinner from "../../_shared/Spinner/Spinner";
import TrackGridItem from "../../_shared/TracksGrid/TrackgridItem/TrackGridItem";
import { PersonalizedPlaylistCard } from "./components/PersonalizedPlaylistCard/PersonalizedPlaylistCard";
import * as styles from "./ForYouPage.module.scss";

interface OwnProps extends RouteComponentProps {
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
    itemsOpen: {
        [key: string]: number | null;
    };
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class ForYou extends React.Component<AllProps, State> {

    public readonly state: State = {
        itemsOpen: {}
    };

    public componentDidMount() {
        this.props.fetchPersonalizedPlaylistsIfNeeded();

    }

    public componentDidUpdate() {
        this.props.fetchPersonalizedPlaylistsIfNeeded();
    }

    public render() {
        const { loading, items } = this.props;

        if (loading && !items) {
            return <Spinner contained={true} />;
        }

        const rest = items ? [...items] : [];

        const weeklyIndex = rest.findIndex((i) => i.query_urn.indexOf("weekly") !== -1);
        const weekly = rest.splice(weeklyIndex, 1)[0];

        const uploadIndex = rest.findIndex((i) => i.query_urn.indexOf("newforyou") !== -1);
        const upload = rest.splice(uploadIndex, 1)[0];

        return (
            <div className={styles.container}>

                {
                    weekly && this.renderPlaylist(
                        "Made for you",
                        "Playlists created by SoundCloud just for you",
                        [...weekly.system_playlists || [], ...upload.system_playlists || []]
                    )
                }
                {
                    rest && rest.map((i) => {
                        return (
                            <div key={i.urn}>
                                {this.renderPlaylist(i.title, i.description, i.system_playlists, i.playlists)}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    public renderPlaylist = (
        title: string,
        description: string,
        systemPlaylistIds: string[] = [],
        playlistIds: string[] = []
    ) => {

        const ids = systemPlaylistIds.length ? systemPlaylistIds : playlistIds;
        const shown = this.state.itemsOpen[title] || 6;
        const showMore = shown < ids.length;

        return (
            <>
                <h3 className={styles.header}>{title}</h3>
                <div className={styles.subtitle}>{description}</div>

                <div className={cn(styles.playlists, "row")}>

                    {
                        systemPlaylistIds
                            .slice(0, shown || 6)
                            .map((id) => {
                                const playlist: SoundCloud.SystemPlaylist = this.props.playlistEntities[id];

                                if (!playlist) { return null; }

                                return (
                                    <div
                                        key={id}
                                        className="col-12 col-xs-6 col-md-4"
                                    >
                                        <PersonalizedPlaylistCard playlist={playlist} system={true} />
                                    </div>
                                );
                            })
                    }

                    {
                        playlistIds
                            .slice(0, shown || 6)
                            .map((id) => {
                                const playlist: SoundCloud.Playlist = this.props.playlistEntities[id];

                                if (!playlist) { return null; }

                                return (
                                    <TrackGridItem
                                        skipFetch={true}
                                        key={id}
                                        idResult={{ id: +id, schema: "playlists" }}
                                        currentPlaylistId={id}
                                    />
                                );
                            })
                    }
                    <div className="col-12 text-right">
                        <a
                            role="button"
                            className={styles.showMore}
                            onClick={() => {

                                let nextPos = shown + 6;

                                if (showMore) {
                                    if (nextPos > ids.length) {
                                        nextPos = ids.length;
                                    }
                                } else {
                                    nextPos = 6;
                                }

                                this.setState({
                                    itemsOpen: {
                                        ...this.state.itemsOpen,
                                        [title]: nextPos
                                    }
                                });
                            }}
                        >
                            <i className={`bx bx-${!showMore ? "chevron-up" : "chevron-down"}`} />
                        </a>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: StoreState) => {
    const { auth: { personalizedPlaylists }, entities: { playlistEntities } } = state;

    return {
        ...personalizedPlaylists,
        playlistEntities
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    fetchPersonalizedPlaylistsIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ForYou);
