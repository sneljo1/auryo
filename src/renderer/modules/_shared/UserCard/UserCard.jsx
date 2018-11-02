import cn from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from "../../../../common/constants/index";
import { SC } from "../../../../common/utils/index";
import FallbackImage from "../FallbackImage";

const UserCard = ({ user, followings, toggleFollowingFunc }) => {
    const following = SC.hasID(user.id, followings);

    return (
        <div className="user_card">
            <div className="user_img">

                <FallbackImage
                    src={SC.getImageUrl(user.avatar_url, IMAGE_SIZES.MEDIUM)}
                    className="imgShadow" />

            </div>
            <div className="user_info">
                <div className="user_username">
                    <Link to={`/user/${user.id}`}>
                        {user.username}
                    </Link>
                </div>
                <a href="javascript:void(0)" className={cn("c_btn outline", { following })}
                    onClick={toggleFollowingFunc}>
                    {following ? <i className='bx bx-check' /> : <i className='bx bx-plus' />}
                    <span>{following ? "Following" : "Follow"}</span>
                </a>
            </div>
        </div>
    )
};

UserCard.propTypes = {
    toggleFollowingFunc: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    followings: PropTypes.object.isRequired
};

export default UserCard;
