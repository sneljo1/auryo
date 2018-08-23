import ua from "universal-analytics";
import { CONFIG } from "../../config";

let a;

// eslint-disable-next-line
export default getUA => {
    if (!a) {
        a = ua(CONFIG.GOOGLE_GA);
    }

    return a

}