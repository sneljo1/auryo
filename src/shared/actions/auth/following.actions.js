import { actionTypes } from "../../constants";
import { SC } from "../../utils";
import fetchToObject from "../../api/helpers/fetchToObject";
import fetchToJson from "../../api/helpers/fetchToJson";

/**
 * get & save auth followings
 *
 * @returns {{type, payload: Promise}}
 */
export function getAuthFollowings() {
    return {
        type: actionTypes.AUTH_SET_FOLLOWINGS,
        payload: fetchToObject(SC.getFollowingsUrl())
    };
}

/**
 * Toggle following of a specific user
 *
 * @param user_id
 * @returns {function(*, *)}
 */
export function toggleFollowing(user_id) {
    return (dispatch, getState) => {
        const { auth: { followings } } = getState();

        const following = SC.hasID(user_id, followings)

        dispatch({
            type: actionTypes.AUTH_SET_FOLLOWING,
            payload: fetchToJson(SC.updateFollowingUrl(user_id), {
                method: (!following) ? "PUT" : "DELETE"
            }).then(() => ({
                user_id,
                following: !following
            }))
        })

    }
}
