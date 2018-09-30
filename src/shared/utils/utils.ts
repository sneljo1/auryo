import fetchToJson from '../api/helpers/fetchToJson';
import { SC } from '.';
import { SoundCloud } from '../../types';
import { history } from '../../renderer/configureStore';
import { IPC } from './ipc';

export class Utils {
    static resolveUrl(url: string) {
        fetchToJson(SC.resolveUrl(url))
            .then((json: SoundCloud.Asset<any>) => {
                switch (json.kind) {
                    case 'track':
                        return history.replace(`/track/${json.id}`);
                    case 'user':
                        return history.replace(`/user/${json.id}`);
                    default:
                        throw Error('Not implemented');
                }
            })
            .catch(() => {
                history.goBack();
                IPC.openExternal(unescape(url));
            });
    }
}
