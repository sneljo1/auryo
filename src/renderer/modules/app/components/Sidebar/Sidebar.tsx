import cn from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { SoundCloud } from '../../../../../types';
import CustomScroll from '../../../_shared/CustomScroll';
import SideBarPlaylist from './playlist/SideBarPlaylist';

interface Props {
    currentPlaylistId: string | null;
    playlists: Array<SoundCloud.Playlist>;
    playing: boolean;
}

type AllProps = Props & RouteComponentProps<{}>;

class SideBar extends React.Component<AllProps> {

    shouldComponentUpdate(nextProps: AllProps) {
        const { playing, playlists, location, currentPlaylistId } = this.props;

        return !isEqual(playing, nextProps.playing) ||
            !isEqual(playlists, nextProps.playlists) ||
            !isEqual(location, nextProps.location) ||
            !isEqual(currentPlaylistId, nextProps.currentPlaylistId);
    }

    render() {
        const { playlists, playing, currentPlaylistId } = this.props;

        return (

            <aside id='sidebar'
                role='navigation'
                className={cn('sidebar-offcanvas d-flex flex-column', {
                    playing
                })}>

                <div className='drag-strip' />

                <CustomScroll heightRelativeToParent='100%'
                    allowOuterScroll={true}>
                    <div key='sidebar-menu' id='sidebar-menu'>
                        <h2>Discover</h2>
                        <ul className='nav flex-column'>
                            <li className='navItem'>
                                <NavLink exact={true} to='/' className='navLink' activeClassName='active'>
                                    Stream
                                </NavLink>
                            </li>
                            <li className='navItem'>
                                <NavLink exact={true} to='/charts' className='navLink' activeClassName='active'>
                                    Charts
                                </NavLink>
                            </li>
                        </ul>

                        <h2>Me</h2>
                        <ul className='nav flex-column'>
                            <li className='navItem' id='likes'>
                                <NavLink to='/likes' className='navLink' activeClassName='active'>
                                    Likes
                                </NavLink>
                            </li>
                            <li className='navItem' id='mytracks'>
                                <NavLink to='/mytracks' className='navLink' activeClassName='active'>
                                    Tracks
                                </NavLink>
                            </li>
                            <li className='navItem' id='myplaylists'>
                                <NavLink to='/myplaylists' className='navLink' activeClassName='active'>
                                    Playlists
                                </NavLink>
                            </li>
                        </ul>
                        <h2>Playlists</h2>
                        <div id='playlists' className='nav flex-column'>
                            <SideBarPlaylist
                                playlists={playlists}
                                currentPlaylistId={currentPlaylistId} />
                        </div>
                    </div>
                </CustomScroll>
            </aside>
        );
    }
}

export default withRouter(SideBar);
