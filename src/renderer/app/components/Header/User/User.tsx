import * as React from 'react';
import { Link } from 'react-router-dom';
import { AuthUser } from '../../../../../common/store/auth';
import './User.scss';

interface Props {
    me: AuthUser | null;
}

const User = React.memo<Props>(({ me }) => (
    <div className='user'>
        {
            me ? (
                <Link className='userPofile' to={`/user/${me.id}`}>
                    <div className='d-flex align-items-center'>
                        <div className='userName'>
                            {me.username}
                        </div>
                        <div className='userImage'>
                            <img src={me.avatar_url} />
                        </div>
                    </div>
                </Link>
            ) : null
        }
    </div>
));

export default User;
