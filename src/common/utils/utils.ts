import fetchToJson from '../api/helpers/fetchToJson';
import { SC } from '.';
import { SoundCloud } from '../../types';
import { history } from '../../renderer/configureStore';
import { IPC } from './ipc';

export class Utils {
    static resolveUrl(url: string) {
        fetchToJson<SoundCloud.Asset<any>>(SC.resolveUrl(url))
            .then((json) => {
                switch (json.kind) {
                    case 'track':
                        return history.replace(`/track/${json.id}`);
                    case 'playlist':
                        return history.replace(`/playlist/${json.id}`);
                    case 'user':
                        return history.replace(`/user/${json.id}`);
                    default:
                        console.error('Resolve not implemented for', json.kind);
                }
            })
            .catch((err) => {
                console.error(err);
                history.goBack();
                IPC.openExternal(unescape(url));
            });
    }
}
