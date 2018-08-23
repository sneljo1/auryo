import cn from 'classnames';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../shared/constants';
import { abbreviate_number, SC } from '../../../../shared/utils';
import FallbackImage from '../FallbackImage';
import './TrackGridUser.scss';

class TrackGridUser extends React.Component {

    shouldComponentUpdate(nextProps) {
        const { user, following } = this.props

        if (!isEqual(user, nextProps.user) ||
            following !== nextProps.following) {
            return true
        }
        return false
    }

    render() {

        const {
            user: { id, username, avatar_url, followers_count, track_count },
            following,
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
                            <a href="javascript:void(0)" className={cn('c_btn outline', { following })}
                                onClick={toggleFollowingFunc}>
                                {following ? <i className="icon-check" /> : <i className="icon-add" />}
                                <span>{following ? 'Following' : 'Follow'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

TrackGridUser.propTypes = {
    user: PropTypes.object.isRequired,
    toggleFollowingFunc: PropTypes.func.isRequired,
    following: PropTypes.bool,
    withStats: PropTypes.bool
}

TrackGridUser.defaultProps = {
    following: false,
    withStats: false
}

export default TrackGridUser
