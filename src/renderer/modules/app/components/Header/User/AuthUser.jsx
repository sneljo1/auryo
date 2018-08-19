import React from 'react';
import './user.scss';
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const AuthUser = ({ me }) => (
    <div className="user">
        {
            me ? (
                <Link className="userPofile" to={`/user/${me.id}`}>
                    <div className="d-flex align-items-center">
                        <div className="userName">
                            {me.username}
                        </div>
                        <div className="userImage">
                            <img src={me.avatar_url} />
                        </div>
                    </div>
                </Link>
            ) : null
        }
    </div>
);

AuthUser.propTypes = {
    me: PropTypes.object.isRequired
}

export default AuthUser;
