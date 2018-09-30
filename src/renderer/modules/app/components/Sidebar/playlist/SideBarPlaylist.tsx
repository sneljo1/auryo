import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { SoundCloud } from '../../../../../../types';
import TextShortener from '../../../../_shared/TextShortener';

interface Props {
    currentPlaylistId: string | null;
    playlists: Array<SoundCloud.Playlist>;
}

type AllProps = Props & RouteComponentProps<{}>;

class SideBarPlaylist extends React.Component<AllProps> {

    shouldComponentUpdate(nextProps: AllProps) {
        const { playlists, location, currentPlaylistId } = this.props;

        return !isEqual(playlists.length, nextProps.playlists.length) ||
            !isEqual(location, nextProps.location) ||
            !isEqual(currentPlaylistId, nextProps.currentPlaylistId);
    }

    render() {
        const { playlists, currentPlaylistId } = this.props;

        return (
            <React.Fragment>
                {
                    playlists.map((playlist) => (
                        <div key={`sidebar-${playlist.id}`}
                            className={classNames('navItem', {
                                playing: currentPlaylistId && playlist.id === currentPlaylistId
                            })}>
                            <NavLink to={`/playlist/${playlist.id}`}
                                className='navLink'
                                activeClassName='active'>
                                <TextShortener text={playlist.title} />
                            </NavLink>
                        </div>
                    ))
                }
            </React.Fragment>
        );
    }
}

export default withRouter(SideBarPlaylist);
