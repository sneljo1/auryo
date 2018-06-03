import ua from "universal-analytics";
import { GOOGLE_GA } from "../../config";

let a;

export default getUA => {
    if(!a){
        a = ua(GOOGLE_GA);
    }

    return a

}