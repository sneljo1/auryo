import merge from "lodash/merge";
import {actionTypes} from "../constants";

const initialState = {
    playlist_entities: {},
    track_entities: {},
    user_entities: {},
    feedInfo_entities: {},
    comment_entities: {}
};

export default function entities(state = initialState, action) {
    const {payload, type} = action;

    if (payload && payload.entities) {
        return merge({}, state, payload.entities);
    }

    if(type === actionTypes.APP_RESET_STORE){
        state = initialState;
    }

    return state;
}
