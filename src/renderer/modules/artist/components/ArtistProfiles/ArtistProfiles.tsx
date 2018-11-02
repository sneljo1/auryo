import * as React from 'react';
import { SoundCloud } from '../../../../../types';

interface Props {
    profiles?: SoundCloud.UserProfiles;
    className?: string;
}

class ArtistProfiles extends React.Component<Props> {

    static defaultProps: Props = {
        profiles: { items: [], loading: false }
    };

    /*

        SOUNDCLOUD = 'soundcloud',
        INSTAGRAM = 'instagram',
        FACEBOOK = 'facebook',
        TWITTER = 'twitter',
        YOUTUBE = 'youtube',
        SPOTIFY = 'spotify',
        TUMBLR = 'tumblr',
        PINTEREST = 'pinterest',
        SNAPCHAT = 'snapchat',
        PERSONAL = 'personal',
        SONGKICK = 'songkick',
        BEATPORT = 'beatport'

    */
    getIcon(service: string) {

        switch (service) {
            case SoundCloud.ProfileService.SOUNDCLOUD:
            return 'cloud';
            case SoundCloud.ProfileService.SPOTIFY:
            return 'album';
            case SoundCloud.ProfileService.PERSONAL:
                return 'globe';
            default:
                if (SoundCloud.ProfileService[service.toUpperCase()] != null) {
                    return service;
                }
                return 'globe';
        }

    }

    getTitle(title: string) {
        if (!title) return;
        switch (title.toLowerCase()) {
            case 'spotify':
                return 'spotify';
            case 'youtube':
                return 'youtube';
            case 'pinterest':
                return 'pinterest';
            case 'snapchat':
                return 'snapchat';
            default:
                return null;
        }
    }

    render() {
        const { profiles, className } = this.props;

        if (!profiles || !profiles.items.length) return null;

        return (
            <div id='web-profiles' className={className}>
                {
                    profiles.items.map((profile) => {

                        const title = this.getTitle(profile.title);

                        let service: string = profile.service;

                        if (profile.service === SoundCloud.ProfileService.PERSONAL && title) {
                            service = title;
                        }

                        const icon = `bx bx-${this.getIcon(service)}`;

                        return (
                            <a
                                href={profile.url}
                                className={`profile ${profile.service && profile.service != null ? profile.service.toLowerCase() : ''}`}
                                key={profile.id}
                            >
                                <i className={icon} />
                                <span>{profile.title ? profile.title : profile.service}</span>
                            </a>
                        );
                    })
                }
            </div>
        );
    }
}

export default ArtistProfiles;
