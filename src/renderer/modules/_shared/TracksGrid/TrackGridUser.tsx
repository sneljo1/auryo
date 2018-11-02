import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { IMAGE_SIZES } from '../../../../common/constants';
import { StoreState } from '../../../../common/store';
import { abbreviate_number, SC } from '../../../../common/utils';
import { NormalizedResult, SoundCloud } from '../../../../types';
import FallbackImage from '../FallbackImage';
import { getUserEntity } from '../../../../common/store/entities/selectors';
import { toggleFollowing } from '../../../../common/store/auth';
import { isFollowing } from '../../../../common/store/auth/selectors';

interface OwnProps {
    idResult: NormalizedResult;
    withStats?: boolean;
}

interface PropsFromState {
    user: SoundCloud.User | null;
    isFollowing: boolean;
}

interface PropsFromDispatch {
    toggleFollowing: typeof toggleFollowing;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackGridUser extends React.PureComponent<AllProps> {

    static defaultProps: Partial<AllProps> = {
        withStats: false,
    };

    render() {

        const {
            user,
            isFollowing,
            toggleFollowing,
            withStats
        } = this.props;

        if (!user) return null;

        const { id, username, avatar_url, followers_count, track_count } = user;

        const img_url = SC.getImageUrl(avatar_url, IMAGE_SIZES.SMALL);

        return (

            <div className='track-grid-user'>
                <div className='track-grid-user-inner'>
                    <div className='track-grid-user-content'>
                        <div className='user-image'>
                            <FallbackImage src={img_url} width={90} height={90} />
                        </div>
                        <div className='user-info'>
                            <Link to={`/user/${id}`} className='user-title'>{username}</Link>

                            {
                                withStats && <div className='d-flex stats'>
                                    <div className='d-flex align-items-center'>
                                        <i className='bx bx-user-group' /><span>{abbreviate_number(followers_count)}</span>
                                    </div>
                                    <div className='d-flex align-items-center'>
                                        <i className='bx bx-album' /><span>{abbreviate_number(track_count)}</span>
                                    </div>
                                </div>
                            }
                            <a
                                href='javascript:void(0)'
                                className={cn('c_btn outline', { following: isFollowing })}
                                onClick={() => {
                                    toggleFollowing(id);
                                }}
                            >
                                {isFollowing ? <i className='bx bx-check' /> : <i className='bx bx-plus' />}
                                <span>{isFollowing ? 'Following' : 'Follow'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { idResult } = props;

    return {
        isFollowing: isFollowing(idResult.id)(state),
        user: getUserEntity(idResult.id)(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    toggleFollowing,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TrackGridUser);
