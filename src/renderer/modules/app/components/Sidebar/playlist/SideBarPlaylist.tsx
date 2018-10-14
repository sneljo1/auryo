import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { StoreState } from '../../../../../../common/store';
import { getDenormalizedEntities } from '../../../../../../common/store/entities/selectors';
import { getCurrentPlaylistId } from '../../../../../../common/store/player/selectors';
import { NormalizedResult, SoundCloud } from '../../../../../../types';
import TextShortener from '../../../../_shared/TextShortener';

interface OwnProps {
    items: Array<NormalizedResult>;
}

interface PropsFromState {
    playlists: Array<SoundCloud.Playlist>;
    currentPlaylistId: string | null;
}

type AllProps = OwnProps & PropsFromState;

class SideBarPlaylist extends React.PureComponent<AllProps> {
    render() {
        const { playlists, currentPlaylistId } = this.props;

        return (
            <React.Fragment>
                {
                    playlists.map((playlist: SoundCloud.Playlist) => (
                        <div
                            key={`sidebar-${playlist.id}`}
                            className={classNames('navItem', {
                                playing: currentPlaylistId && playlist.id.toString() === currentPlaylistId
                            })}
                        >
                            <NavLink
                                to={`/playlist/${playlist.id}`}
                                className='navLink'
                                activeClassName='active'
                            >
                                <TextShortener text={playlist.title} />
                            </NavLink>
                        </div>
                    ))
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { items } = props;

    return {
        playlists: getDenormalizedEntities<SoundCloud.Playlist>(items)(state),
        currentPlaylistId: getCurrentPlaylistId(state)
    };
};

export default connect<PropsFromState, {}, OwnProps, StoreState>(mapStateToProps)(SideBarPlaylist);
