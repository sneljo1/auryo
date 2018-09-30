import React from 'react';
import { Link } from 'react-router-dom';
import { AuthUser } from '../../../../../../shared/store/auth';

interface Props {
    me: AuthUser | null;
}

class User extends React.PureComponent<Props>{
    render() {
        const { me } = this.props;

        return (
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
        );
    }
}

export default User;
