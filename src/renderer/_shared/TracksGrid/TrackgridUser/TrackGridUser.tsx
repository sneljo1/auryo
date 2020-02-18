import { IMAGE_SIZES } from '@common/constants';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { isFollowing } from '@common/store/auth/selectors';
import { getUserEntity } from '@common/store/entities/selectors';
import { abbreviateNumber, SC } from '@common/utils';
import cn from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Normalized } from '../../../../types';
import FallbackImage from '../../FallbackImage';
import './TrackGridUser.scss';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const { idResult } = props;

  return {
    isAuthUserFollowing: idResult ? isFollowing(idResult.id)(state) : null,
    trackUser: getUserEntity(idResult.id)(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleFollowing: actions.toggleFollowing
    },
    dispatch
  );

interface OwnProps {
  idResult: Normalized.NormalizedResult;
  withStats?: boolean;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackGridUser extends React.PureComponent<AllProps> {
  public static defaultProps: Partial<AllProps> = {
    withStats: false
  };

  public render() {
    const { trackUser, isAuthUserFollowing, toggleFollowing, withStats } = this.props;

    if (!trackUser) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/camelcase, camelcase
    const { id, username, avatar_url, followers_count, track_count } = trackUser;

    const imgUrl = SC.getImageUrl(avatar_url, IMAGE_SIZES.SMALL);

    return (
      <div className="track-grid-user">
        <div className="track-grid-user-inner">
          <div className="track-grid-user-content">
            <div className="user-image">
              <FallbackImage src={imgUrl} width={90} height={90} />
            </div>
            <div className="user-info">
              <Link to={`/user/${id}`} className="user-title">
                {username}
              </Link>

              {withStats && (
                <div className="d-flex stats">
                  <div className="d-flex align-items-center">
                    <i className="bx bx-user-group" />
                    <span>{abbreviateNumber(followers_count)}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bx bx-album" />
                    <span>{abbreviateNumber(track_count)}</span>
                  </div>
                </div>
              )}
              <a
                href="javascript:void(0)"
                className={cn('c_btn outline', { active: isAuthUserFollowing })}
                onClick={() => {
                  toggleFollowing(id);
                }}>
                {isAuthUserFollowing ? <i className="bx bx-check" /> : <i className="bx bx-plus" />}
                <span>{isAuthUserFollowing ? 'Following' : 'Follow'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
  mapStateToProps,
  mapDispatchToProps
)(TrackGridUser);
