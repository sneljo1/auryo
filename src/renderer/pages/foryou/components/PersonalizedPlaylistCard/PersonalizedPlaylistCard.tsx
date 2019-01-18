import * as React from 'react';
import { SoundCloud } from '../../../../../types';
import * as ColorHash from 'color-hash';
import * as styles from './PersonalizedPlaylistCard.module.scss';
import { Link } from 'react-router-dom';
import TextShortener from '../../../../_shared/TextShortener';
import moment = require('moment');

const colorHash = new ColorHash({ saturation: .7, lightness: .775 });

interface Props {
    playlist: SoundCloud.SystemPlaylist;
    title?: string;
    system?: boolean;
}

export const PersonalizedPlaylistCard = React.memo<Props>(({ playlist, title, system }) => {
    return (
        <Link
            className={styles.card}
            to={`/personalized/${playlist.id}`}
        >

            <div
                className={styles.content}
                style={{ background: `${colorHash.hex(playlist.short_title + playlist.short_description)}` }}
            >

                <img
                    className={styles.bgImage}
                    src={playlist.artwork_url || playlist.calculated_artwork_url}

                />
                <img src={playlist.artwork_url || playlist.calculated_artwork_url} />

                <div className={styles.title}>{playlist.short_description || playlist.title || title}</div>
                <div><TextShortener text={playlist.short_title || playlist.description} /></div>
            </div>
            {
                system && playlist.last_updated && (
                    <span className={styles.updated}>Last updated {moment(new Date(playlist.last_updated)).fromNow()}</span>
                )
            }
        </Link>
    );
});
