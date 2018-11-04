import { MenuDivider, MenuItem } from '@blueprintjs/core';
import * as React from 'react';
import { CONFIG } from '../../config';
import { IPC } from '../../common/utils/ipc';

interface Props {
    title?: string;
    username: string;
    permalink: string;
}

const ShareMenuItem = React.memo<Props>(({ title, username, permalink: rawPermalink }) => {

    let text = `Listen to "${title || username}"`;

    if (title) {
        text += ` by ${username}`;
    }

    const url = new URL(rawPermalink);
    const params = new URLSearchParams(url.search.slice(1));

    params.append('utm_source', 'auryo');
    params.append('utm_medium', 'social');

    const permalink = `${url.origin + url.pathname}?${params}`;

    return (
        <MenuItem text='Share'>
            <MenuItem
                text='Via Twitter'
                onClick={() => {
                    // tslint:disable-next-line:max-line-length
                    IPC.openExternal(`https://twitter.com/intent/tweet?hashtags=SoundCloudForDesktop,Auryo&related=Auryoapp&via=Auryoapp&text=${text}&url=${permalink}`);
                }}
            />
            <MenuItem
                text='Via Facebook'
                onClick={() => {
                    // tslint:disable-next-line:max-line-length
                    IPC.openExternal(`https://www.facebook.com/dialog/share?quote=${text}%20via%20Auryo&hashtag=%23SoundCloud&app_id=${CONFIG.FB_APP_ID}&display=popup&href=${permalink}&redirect_uri=http://auryo.com`);
                }}
            />
            <MenuItem
                text='Via Messenger'
                onClick={() => {
                    // tslint:disable-next-line:max-line-length
                    IPC.openExternal(`https://www.facebook.com/dialog/send?app_id=${CONFIG.FB_APP_ID}&link=${permalink}&redirect_uri=http://auryo.com`);
                }}
            />
            <MenuItem
                text='Via Email'
                onClick={() => {
                    // tslint:disable-next-line:max-line-length
                    IPC.openExternal(`mailto:?&subject=Checkout this ${title ? 'track' : 'artist'} on Soundcloud&body=${text}%20${permalink}%20via%20http%3A//auryo.com`);
                }}
            />
            <MenuDivider />
            <MenuItem
                text='Copy to clipboard'
                onClick={() => {
                    IPC.writeToClipboard(permalink);
                }}
            />
        </MenuItem>
    );
});

export default ShareMenuItem;
