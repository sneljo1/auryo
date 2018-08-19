import is from 'electron-is';
import IFeature from '../IFeature';

export default class ILinuxFeature extends IFeature {

    // eslint-disable-next-line
    shouldRun() {
        return is.linux();
    }

}