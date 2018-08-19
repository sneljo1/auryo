import electron_settings from "electron-settings";

// eslint-disable-next-line
let settings = null;
let settingData = {};

if (!process.env.TOKEN) {
    settings = electron_settings;
} else {
    settings = {
        getAll() {
            return settingData;
        },
        setAll(s) {
            settingData = s;
        },
        set(name, val) {
            settingData[name] = val;
        },

        get(name) {
            return settingData[name]
        },

        hasSync(name) {
            return settingData[name] !== null;
        },
    }

}

export default settings;
