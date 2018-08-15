import React from 'react';
import './user.scss';

export const AuthUser = ({ me, push }) => (
    <div className="user">
        {
            me ? (
                <a className="userPofile" href="javascript:void(0)" onClick={() => {
                    push('/user/' + me.id);
                }}>
                    <div className="d-flex align-items-center">
                        <div className="userName">
                            {me.username}
                        </div>
                        <div className="userImage">
                            <img src={me.avatar_url} />
                        </div>
                    </div>
                </a>
            ) : null
        }
    </div>
);

export default AuthUser;
