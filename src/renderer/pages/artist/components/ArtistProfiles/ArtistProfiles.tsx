import { getUserProfiles } from '@common/store/actions';
import { getNormalizedUserProfiles, isUserProfilesError, isUserProfilesLoading } from '@common/store/selectors';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SoundCloud } from '../../../../../types';
import './ArtistProfiles.scss';

interface Props {
  userUrn: string;
  className?: string;
}

export const ArtistProfiles: FC<Props> = ({ userUrn, className }) => {
  const dispatch = useDispatch();
  const profiles = useSelector(getNormalizedUserProfiles(userUrn));
  const loading = useSelector(isUserProfilesLoading(userUrn));
  const error = useSelector(isUserProfilesError(userUrn));

  const getIcon = (service: string) => {
    switch (service) {
      case SoundCloud.ProfileService.SOUNDCLOUD:
        return '-cloud';
      case SoundCloud.ProfileService.SPOTIFY:
        return '-album';
      case SoundCloud.ProfileService.PERSONAL:
      case SoundCloud.ProfileService.SNAPCHAT:
        return '-globe';
      default:
        if (SoundCloud.ProfileService[service.toUpperCase()] != null) {
          return `l-${service}`;
        }

        return '-globe';
    }
  };

  const getTitle = (title: string) => {
    if (!title) {
      return null;
    }
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
  };

  // Fetch user if it does not exist yet
  useEffect(() => {
    if (!profiles && !loading) {
      dispatch(getUserProfiles.request({ userUrn }));
    }
  }, [loading, error, dispatch, profiles, userUrn]);

  if (!profiles?.length) {
    return null;
  }

  return (
    <div id="web-profiles" className={className}>
      {profiles.map(profile => {
        const title = getTitle(profile.title);

        const network = profile?.network;

        let iconString = network.toString();

        if (network === SoundCloud.ProfileService.PERSONAL && title) {
          iconString = title;
        }

        const icon = `bx bx${getIcon(iconString)}`;

        return (
          <a href={profile.url} className={`profile ${network?.toLowerCase() ?? ''}`} key={profile.title}>
            <i className={icon} />
            <span>{profile.title ? profile.title : network}</span>
          </a>
        );
      })}
    </div>
  );
};
