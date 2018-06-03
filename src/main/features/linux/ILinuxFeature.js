import is from 'electron-is';
import IFeature from '../IFeature';

export default class ILinuxFeature extends IFeature {

    shouldRun() {
        return is.linux();
    }

}