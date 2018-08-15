/**
 * Add a function from a failed request to the queue. If already exists, do nothing.
 *
 * @param func  - Said function
 * @param args  - Arguments for this function
 * @returns {function(*, *)}
 */
import {actionTypes} from "../../constants";
import {initApp, setLoaded} from "./app.actions";

let interval;

export function addQueuedFunction(func, args) {
    return (dispatch, getState) => {
        const {app} = getState();

        dispatch(isOnline(() => {
            const key = func.name + Array.prototype.slice.call(args).join('|');

            if (app.queued_items.indexOf(key) == -1) {
                dispatch(addFunction(func, key));
            }

            if (!interval) {
                dispatch(initCheckOnline());
            }
        }, false));


    }
}

/**
 * Toggle the site on/offline
 *
 * @param offline
 * @returns {{type, time: number, offline: *}}
 */
export function toggleOffline(offline) {
    return {
        type: actionTypes.APP_TOGGLE_OFFLINE,
        payload: {
            time: new Date().getTime(),
            offline
        }
    }
}

/**
 * Add a function to the queue
 *
 * @param func
 * @param key
 * @returns {{type, func: *, key: *}}
 */
function addFunction(func, key) {
    return {
        type: actionTypes.APP_PUSH_OFFLINE_QUEUE,
        payload: {
            func,
            key
        }
    }
}

/**
 * Remove a function from the queue
 *
 * @param key
 * @returns {{type, key: *}}
 */
function removeFunction(key) {
    return {
        type: actionTypes.APP_POP_OFFLINE_QUEUE,
        payload: {
            key
        }
    }
}

/**
 * Clear the queue
 *
 * @returns {{type}}
 */
function clearFunctions() {
    return {
        type: actionTypes.APP_CLEAR_OFFLINE_QUEUE,
        payload: null
    }
}

/**
 * Initialize the check interval for when the site is offline
 *
 * @returns {function(*)}
 */
function initCheckOnline() {
    return dispatch => {

        if (interval) return;

        interval = setInterval(() => {

            dispatch(checkOnline())

        }, 5000);
    }
}

/**
 * Check if we can reach google.com, if so dispatch & remove the queued functions.
 *
 * @returns {function(*=, *)}
 */
function checkOnline() {
    return (dispatch, getState) => {
        const {app} = getState();

        if (!app.offline && app.queued_items.length == 0) {
            clearInterval(interval);
            interval = null;
            dispatch(clearFunctions);
            if (!app.loaded) {
                dispatch(initApp());
            }
        }

        const cur_time = (new Date()).getTime();

        if ((cur_time - app.last_checked) > 5000) {
            fetch("http://google.com")
                .then(res => {
                    dispatch(toggleOffline(false));

                    app.queued_items.forEach(function (key) {
                        const func = app.queued_functions[key];
                        dispatch(removeFunction(key));
                        dispatch(func());
                    })
                })
                .catch(err => {
                    dispatch(toggleOffline(true));
                })
        }
    }
}

/**
 * Ping google.com to check if online. If not online, try and start the interval.
 *
 * @param func
 * @param disp
 * @returns {function(*)}
 */
export function isOnline(func, disp) {
    return (dispatch) => {
        fetch("https://google.com")
            .then(res => {
                dispatch(toggleOffline(false));
            })
            .catch(err => {
                dispatch(toggleOffline(true));

                if (func) {
                    if (disp) {
                        dispatch(func());
                    } else {
                        func();
                    }
                }

                if (!interval) {
                    dispatch(initCheckOnline());
                }
            })
    }
}
