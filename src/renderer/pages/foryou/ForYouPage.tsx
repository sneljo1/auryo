import * as cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { StoreState } from '../../../common/store';
import { fetchPersonalizedPlaylistsIfNeeded } from '../../../common/store/auth';
import { EntitiesState } from '../../../common/store/entities';
import { setScrollPosition } from '../../../common/store/ui';
import { getPreviousScrollTop } from '../../../common/store/ui/selectors';
import { NormalizedPersonalizedItem, SoundCloud } from '../../../types';
import Header from '../../app/components/Header/Header';
import CustomScroll from '../../_shared/CustomScroll';
import Spinner from '../../_shared/Spinner/Spinner';
import WithHeaderComponent from '../../_shared/WithHeaderComponent';
import { PersonalizedPlaylistCard } from './components/PersonalizedPlaylistCard/PersonalizedPlaylistCard';
import * as styles from './ForYouPage.module.scss';
import TrackGridItem from '../../_shared/TracksGrid/TrackgridItem/TrackGridItem';
import { show } from 'redux-modal';

interface OwnProps extends RouteComponentProps<{}> {
}

interface PropsFromState {
    previousScrollTop?: number;
    loading: boolean;
    items: Array<NormalizedPersonalizedItem> | null;
    playlistEntities: EntitiesState['playlistEntities'];

}

interface PropsFromDispatch {
    setScrollPosition: typeof setScrollPosition;
    fetchPersonalizedPlaylistsIfNeeded: typeof fetchPersonalizedPlaylistsIfNeeded;
}

interface State {
    scrollTop: number;
    itemsOpen: {
        [key: string]: number | null;
    };
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class ForYou extends WithHeaderComponent<AllProps, State> {

    readonly state = {
        scrollTop: 0,
        itemsOpen: {}
    };

    componentDidMount() {
        super.componentDidMount();

        this.props.fetchPersonalizedPlaylistsIfNeeded();

    }

    componentDidUpdate() {
        this.props.fetchPersonalizedPlaylistsIfNeeded();
    }

    render() {
        const { loading, items } = this.props;

        if (loading && !items) {
            return <Spinner contained={true} />;
        }

        const rest = items ? [...items] : [];

        const weeklyIndex = rest.findIndex((i) => i.query_urn.indexOf('weekly') !== -1);
        const weekly = rest.splice(weeklyIndex, 1)[0];

        const uploadIndex = rest.findIndex((i) => i.query_urn.indexOf('newforyou') !== -1);
        const upload = rest.splice(uploadIndex, 1)[0];

        return (
            <CustomScroll
                heightRelativeToParent='100%'
                allowOuterScroll={true}
                ref={(r) => this.scroll = r}
                onScroll={this.debouncedOnScroll}
            >

                <Header
                    scrollTop={this.state.scrollTop}
                />

                <div className={styles.container}>

                    {
                        weekly && this.renderPlaylist(
                            'Made for you',
                            'Playlists created by SoundCloud just for you',
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


            </CustomScroll>
        );
    }

    renderPlaylist = (title: string, description: string, systemPlaylistIds: Array<string> = [], playlistIds: Array<string> = []) => {

        const ids = systemPlaylistIds.length ? systemPlaylistIds : playlistIds;
        const shown = this.state.itemsOpen[title] || 6;
        const showMore = shown < ids.length;

        return (
            <>
                <h3 className={styles.header}>{title}</h3>
                <div className={styles.subtitle}>{description}</div>

                <div className={cn(styles.playlists, 'row')}>

                    {
                        systemPlaylistIds
                            .slice(0, shown || 6)
                            .map((id) => {
                                const playlist: SoundCloud.SystemPlaylist = this.props.playlistEntities[id];

                                if (!playlist) return null;

                                return (
                                    <div
                                        key={id}
                                        className='col-12 col-xs-6 col-md-4'
                                    >
                                        <PersonalizedPlaylistCard playlist={playlist} />
                                    </div>
                                );
                            })
                    }

                    {
                        playlistIds
                            .slice(0, shown || 6)
                            .map((id) => {
                                const playlist: SoundCloud.Playlist = this.props.playlistEntities[id];

                                if (!playlist) return null;

                                return (
                                    <TrackGridItem
                                        skipFetch={true}
                                        key={id}
                                        idResult={{ id: +id, schema: 'playlists' }}
                                        currentPlaylistId={id}
                                    />
                                );
                            })
                    }
                    <div className='col-12 text-right'>
                        <a
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
                            <i className={`bx bx-${!showMore ? 'chevron-up' : 'chevron-down'}`} />
                        </a>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth: { personalizedPlaylists }, entities: { playlistEntities } } = state;

    return {
        previousScrollTop: getPreviousScrollTop(state),
        ...personalizedPlaylists,
        playlistEntities
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    setScrollPosition,
    fetchPersonalizedPlaylistsIfNeeded,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ForYou);
