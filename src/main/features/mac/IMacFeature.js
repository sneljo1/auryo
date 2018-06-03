import is from 'electron-is';
import IFeature from '../IFeature';

export default class IWindowsFeature extends IFeature {

    shouldRun() {
        return is.macOS();
    }

}