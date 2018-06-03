import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonDropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import cn from 'classnames';

class ActionsDropdown extends Component {
    
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.state.dropdownOpen !== nextState.dropdownOpen ||
            this.props.track.id !== nextProps.track.id ||
            this.props.liked !== nextProps.liked ||
            this.props.index !== nextProps.index ||
            this.props.reposted !== nextProps.reposted;
    }

    constructor(props) {
        super();

        this.state = {
            dropdownOpen: false
        };

        this.toggle = this.toggle.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    onClick(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        this.toggle();
    }

    render() {
        const { toggleLike, toggleRepost, show, reposted, liked, track, addUpNext, index } = this.props;

        const trackId = track.id;

        return (
            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}
                            className="actions-dropdown">

                <DropdownToggle tag="a" className="toggle" href="javascript:void(0)" onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}>
                    <i className="icon-more_horiz" />
                </DropdownToggle>
                <DropdownMenu right>
                    <a href="javascript:void(0)" className={cn('dropdown-item', { liked: liked })}
                       onClick={(e) => {
                           this.onClick(e);
                           toggleLike(trackId, track.kind === 'playlist');
                       }}>
                        <div className="d-flex flex-nowrap align-items-center">
                            <i className={cn(liked ? 'icon-favorite' : 'icon-favorite_border', {
                                'text-primary': liked
                            })} /> {liked ? 'Liked' : 'Like'}
                        </div>
                    </a>

                    <a href="javascript:void(0)" className={cn('dropdown-item', { reposted: reposted })}
                       onClick={(e) => {
                           this.onClick(e);
                           toggleRepost(trackId);

                       }}>
                        <div className="d-flex flex-nowrap align-items-center">
                            <i className={cn('icon-retweet', { 'text-primary': reposted })} /> {reposted ? 'Reposted' : 'Repost'}
                        </div>
                    </a>

                    {
                        track.kind !== 'playlist' ? (
                            <a href="javascript:void(0)" className="dropdown-item" onClick={(e) => {
                                this.onClick(e);
                                show('addToPlaylist', { trackID: trackId });

                            }}>
                                <div className="d-flex flex-nowrap align-items-center">
                                    <i className="icon-playlist_add" /> Add to playlist
                                </div>
                            </a>
                        ) : null
                    }

                    <a href="javascript:void(0)" className="dropdown-item" onClick={(e) => {
                        this.onClick(e);
                        addUpNext(trackId, track.kind === 'playlist' ? track : null);

                    }}>
                        <div className="d-flex flex-nowrap align-items-center">
                            <i className="icon-playlist_play" /> Add to queue
                        </div>
                    </a>

                    {
                        index !== undefined ? (
                            <a href="javascript:void(0)" className="dropdown-item" onClick={(e) => {
                                this.onClick(e);
                                addUpNext(trackId, track.kind === 'playlist' ? track : null, index);

                            }}>
                                <div className="d-flex flex-nowrap align-items-center">
                                    <i className="icon-x" /> Remove from queue
                                </div>
                            </a>
                        ) : null
                    }
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}

ActionsDropdown.propTypes = {
    liked: PropTypes.bool.isRequired,
    reposted: PropTypes.bool.isRequired,
    track: PropTypes.object.isRequired,
    index: PropTypes.number,

    show: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired,
    toggleLike: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired
};

export default ActionsDropdown;