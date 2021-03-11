import { SoundCloud } from '@types';
import React from 'react';
import { Link } from 'react-router-dom';
import './User.scss';

interface Props {
  currentUser?: SoundCloud.User | null;
}

const User = React.memo<Props>(({ currentUser }) => {
  if (!currentUser) {
    return null;
  }
  return (
    <div className="user">
      <Link className="userProfile" to={`/user/${currentUser.id}`}>
        <div className="d-flex align-items-center">
          <div className="userName">{currentUser.username}</div>
          <div className="userImage">
            <img src={currentUser.avatar_url} alt="user avatar" />
          </div>
        </div>
      </Link>
    </div>
  );
});

export default User;
