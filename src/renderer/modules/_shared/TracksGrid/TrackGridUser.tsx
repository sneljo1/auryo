import cn from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../shared/constants';
import { abbreviate_number, SC } from '../../../../shared/utils';
import { SoundCloud } from '../../../../types';
import FallbackImage from '../FallbackImage';

interface Props {
    user: SoundCloud.User;
    isFollowing?: boolean;
    withStats?: boolean;

    toggleFollowingFunc: () => void;
}

class TrackGridUser extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        withStats: false,
        isFollowing: false
    }

    shouldComponentUpdate(nextProps: Props) {
        const { user, isFollowing } = this.props

        if (!isEqual(user, nextProps.user) ||
            isFollowing !== nextProps.isFollowing) {
            return true
        }
        return false
    }

    render() {

        const {
            user: { id, username, avatar_url, followers_count, track_count },
            isFollowing,
            toggleFollowingFunc,
            withStats
        } = this.props

        const img_url = SC.getImageUrl(avatar_url, IMAGE_SIZES.SMALL)

        return (

            <div className="track-grid-user">
                <div className="track-grid-user-inner">
                    <div className="track-grid-user-content">
                        <div className="user-image">
                            <FallbackImage src={img_url} width={90} height={90} />
                        </div>
                        <div className="user-info">
                            <Link to={`/user/${id}`} className="user-title">{username}</Link>

                            {
                                withStats && <div className="d-flex stats">
                                    <div className="d-flex align-items-center">
                                        <i className="icon-people" /><span>{abbreviate_number(followers_count)}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i className="icon-disc" /><span>{abbreviate_number(track_count)}</span>
                                    </div>
                                </div>
                            }
                            <a href="javascript:void(0)" className={cn('c_btn outline', { following: isFollowing })}
                                onClick={toggleFollowingFunc}>
                                {isFollowing ? <i className="icon-check" /> : <i className="icon-add" />}
                                <span>{isFollowing ? 'Following' : 'Follow'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default TrackGridUser
