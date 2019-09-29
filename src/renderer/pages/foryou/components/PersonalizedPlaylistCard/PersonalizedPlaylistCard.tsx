import * as ColorHash from "color-hash";
import * as moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import { SoundCloud } from "../../../../../types";
import * as styles from "./PersonalizedPlaylistCard.module.scss";

const colorHash = new ColorHash({ saturation: .7, lightness: .775 });

interface Props {
    playlist: SoundCloud.SystemPlaylist;
    title?: string;
    system?: boolean;
}

export const PersonalizedPlaylistCard = React.memo<Props>(({ playlist, title, system }) => {
    const shortTitle = playlist.short_title || playlist.description;
    const imageUrl = playlist.artwork_url || playlist.calculated_artwork_url;

    return (
        <Link
            className={styles.card}
            to={`/personalized/${playlist.id}`}
        >

            <div
                className={styles.content}
                style={{ background: `${colorHash.hex(playlist.short_title + playlist.short_description)}` }}
            >

                {
                    imageUrl && (
                        <>
                            <img
                                alt="bgImage"
                                className={styles.bgImage}
                                src={imageUrl}

                            />
                            <img
                                alt="bgImage"
                                src={imageUrl} />
                        </>
                    )
                }

                <div className={styles.title}>{playlist.short_description || playlist.title || title}</div>
                <div>{shortTitle}</div>
            </div>
            {
                system && playlist.last_updated && (
                    <span className={styles.updated}>Last updated {moment(new Date(playlist.last_updated)).fromNow()}</span>
                )
            }
        </Link>
    );
});
