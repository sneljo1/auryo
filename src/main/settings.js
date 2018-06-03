import electron_settings from "electron-settings";

let settings = null;
let _settings = {};

if (!process.env.TOKEN) {
    settings = electron_settings;
} else {
    settings = {
        getAll(){
            return _settings;
        },
        setAll(s){
            _settings = s;
        },
        set(name, val) {
            _settings[name] = val;
        },

        get(name){
            return _settings[name]
        },

        hasSync(name){
            return _settings[name] !== null;
        },
    }

}

export default settings;
