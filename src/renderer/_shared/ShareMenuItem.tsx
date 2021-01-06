import { MenuDivider, MenuItem } from '@blueprintjs/core';
import { copyToClipboard, openExternalUrl } from '@common/store/actions';
import React from 'react';
import { useDispatch } from 'react-redux';
import { CONFIG } from '../../config';

interface Props {
  title?: string;
  username: string;
  permalink: string;
}

const ShareMenuItem = React.memo<Props>(({ title, username, permalink: rawPermalink }) => {
  const dispatch = useDispatch();
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
    <MenuItem text="Share">
      <MenuItem
        text="Via Twitter"
        onClick={() => {
          dispatch(
            openExternalUrl(
              `https://twitter.com/intent/tweet?hashtags=SoundCloudForDesktop,Auryo&related=Auryoapp&via=Auryoapp&text=${text}&url=${permalink}`
            )
          );
        }}
      />
      <MenuItem
        text="Via Facebook"
        onClick={() => {
          dispatch(
            openExternalUrl(
              `https://www.facebook.com/dialog/share?quote=${text}%20via%20Auryo&hashtag=%23SoundCloud&app_id=${CONFIG.FB_APP_ID}&display=popup&href=${permalink}&redirect_uri=http://auryo.com`
            )
          );
        }}
      />
      <MenuItem
        text="Via Messenger"
        onClick={() => {
          dispatch(
            openExternalUrl(
              `https://www.facebook.com/dialog/send?app_id=${CONFIG.FB_APP_ID}&link=${permalink}&redirect_uri=http://auryo.com`
            )
          );
        }}
      />
      <MenuItem
        text="Via Email"
        onClick={() => {
          dispatch(
            openExternalUrl(
              `mailto:?&subject=Checkout this ${
                title ? 'track' : 'artist'
              } on Soundcloud&body=${text}%20${permalink}%20via%20http%3A//auryo.com`
            )
          );
        }}
      />
      <MenuDivider />
      <MenuItem
        text="Copy to clipboard"
        onClick={() => {
          dispatch(copyToClipboard(permalink));
        }}
      />
    </MenuItem>
  );
});

export default ShareMenuItem;
