import React from 'react'
import config from '../../../config'
import { openExternal, writeToClipboard } from '../../../shared/actions'
import { MenuDivider, MenuItem } from '@blueprintjs/core'

const ShareMenuItem = ({ title, username, permalink }) => {

    let text = `Listen to "${title || username}"`

    if (title) {
        text += ` by ${username}`
    }

    return (
        <MenuItem text="Share">
            <MenuItem text="Via Twitter"
                      onClick={openExternal.bind(this, `https://twitter.com/intent/tweet?hashtags=SoundCloud,desktop&related=Auryoapp&via=Auryoapp&text=${text}&url=${permalink}`)} />
            <MenuItem text="Via Facebook"
                      onClick={openExternal.bind(this, `https://www.facebook.com/dialog/share?quote=${text}%20via%20Auryo&hashtag=%23SoundCloud&app_id=${config.FB_APP_ID}&display=popup&href=${permalink}&redirect_uri=http://auryo.com`)} />
            <MenuItem text="Via Messenger"
                      onClick={openExternal.bind(this, `https://www.facebook.com/dialog/send?app_id=${config.FB_APP_ID}&link=${permalink}&redirect_uri=http://auryo.com`)} />
            <MenuItem text="Via Email"
                      onClick={openExternal.bind(this, `mailto:?&subject=Checkout this ${title ? 'track' : 'artist'} on Soundcloud&body=${text}%20${permalink}%20via%20http%3A//auryo.com`)} />
            <MenuDivider />
            <MenuItem text="Copy to clipboard"
                      onClick={writeToClipboard.bind(this, permalink)} />
        </MenuItem>
    )
}

export default ShareMenuItem