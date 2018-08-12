import React from 'react'
import PropTypes from 'prop-types'
import { IMAGE_SIZES } from '../../../../shared/constants/index'
import { abbreviate_number, SC } from '../../../../shared/utils/index'
import './TrackGridUser.scss'
import { Link } from 'react-router-dom'
import FallbackImage from '../FallbackImage'
import cn from 'classnames'

class TrackGridUser extends React.Component {

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
                            <Link to={'/user/' + id} className="user-title">{username}</Link>

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
                            <a href="javascript:void(0)" className={cn('c_btn outline', { following: following })}
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

export default TrackGridUser
