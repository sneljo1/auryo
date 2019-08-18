import { IMAGE_SIZES } from "@common/constants";
import { StoreState } from "@common/store";
import { toggleFollowing } from "@common/store/auth";
import { isFollowing } from "@common/store/auth/selectors";
import { abbreviate_number, SC } from "@common/utils";
import cn from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import { SoundCloud } from "../../../../types";
import FallbackImage from "../../FallbackImage";
import "./TrackGridUser.scss";

interface OwnProps {
    trackUser: SoundCloud.User | null;
    withStats?: boolean;
}


type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;


type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackGridUser extends React.PureComponent<AllProps> {

    public static defaultProps: Partial<AllProps> = {
        withStats: false,
    };

    public render() {

        const {
            trackUser,
            isFollowing,
            toggleFollowing,
            withStats
        } = this.props;

        if (!trackUser) { return null; }

        const { id, username, avatar_url, followers_count, track_count } = trackUser;

        const img_url = SC.getImageUrl(avatar_url, IMAGE_SIZES.SMALL);

        return (

            <div className="track-grid-user">
                <div className="track-grid-user-inner">
                    <div className="track-grid-user-content">
                        <div className="user-image">
                            <FallbackImage src={img_url} width={90} height={90} />
                        </div>
                        <div className="user-info">
                            <Link to={`/user/${id}`} className="user-title">{username}</Link>

                            {
                                withStats && <div className="d-flex stats">
                                    <div className="d-flex align-items-center">
                                        <i className="bx bx-user-group" /><span>{abbreviate_number(followers_count)}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i className="bx bx-album" /><span>{abbreviate_number(track_count)}</span>
                                    </div>
                                </div>
                            }
                            <a
                                href="javascript:void(0)"
                                className={cn("c_btn outline", { active: isFollowing })}
                                onClick={() => {
                                    toggleFollowing(id);
                                }}
                            >
                                {isFollowing ? <i className="bx bx-check" /> : <i className="bx bx-plus" />}
                                <span>{isFollowing ? "Following" : "Follow"}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
    const { trackUser } = props;

    return {
        isFollowing: trackUser ? isFollowing(trackUser.id)(state) : null,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    toggleFollowing,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TrackGridUser);
