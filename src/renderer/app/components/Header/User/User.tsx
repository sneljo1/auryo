import { AuthUser } from '@common/store/auth';
import React from 'react';
import { Link } from 'react-router-dom';
import './User.scss';

interface Props {
  me: AuthUser | null;
}

const User = React.memo<Props>(({ me }) => (
  <div className="user">
    {me ? (
      <Link className="userProfile" to={`/user/${me.id}`}>
        <div className="d-flex align-items-center">
          <div className="userName">{me.username}</div>
          <div className="userImage">
            <img src={me.avatar_url} alt="user avatar" />
          </div>
        </div>
      </Link>
    ) : null}
  </div>
));

export default User;
