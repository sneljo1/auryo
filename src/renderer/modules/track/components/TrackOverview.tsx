import * as moment from 'moment';
import * as React from 'react';
import { ObjectState } from '../../../../common/store/objects';
import { abbreviate_number } from '../../../../common/utils';
import { SoundCloud, NormalizedResult } from '../../../../types';
import CommentList from '../../_shared/CommentList/CommentList';
import Linkify from '../../_shared/Linkify';
import ToggleMore from '../../_shared/ToggleMore';
import TrackGridUser from '../../_shared/TracksGrid/TrackGridUser';
import { Link } from 'react-router-dom';

interface Props {
    track: SoundCloud.Track;
    comments: ObjectState<NormalizedResult> | null;
}

export default class TrackOverview extends React.PureComponent<Props> {
    render() {
        const { track, comments } = this.props;

        const tags = track.tag_list
            .split(/\s(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/g)
            .reduce((all: Array<string>, obj: string) => {
                if (obj && obj !== '"') {
                    all.push(obj.replace(/"/g, ''));
                }

                return all;
            }, []);

        return (
            <div className='row'>
                <div className='col-12 col-lg-3'>
                    <div className='row'>
                        <div className='col-6 col-lg-12'>
                            <TrackGridUser
                                idResult={{ id: track.user_id, schema: 'users' }}
                            />
                        </div>

                        <div className='col-6 col-lg-12'>
                            <div className='p-3 track-info'>
                                <strong>Created</strong>
                                <div>{moment(new Date(track.created_at)).fromNow()}</div>

                                {
                                    track.label_name && (
                                        <React.Fragment>
                                            <strong>Label</strong>
                                            <div>{track.label_name}</div>
                                        </React.Fragment>
                                    )
                                }

                            </div>
                        </div>
                    </div>
                </div>

                <div className='trackPadding col-12 col-lg'>
                    <div className='flex stats align-items-center justify-content-between'>
                        <div
                            className='taglist'
                        >
                            {tags.map((tag) => (
                                <Link key={tag} to={`/tags/${tag}`}>
                                    <span className='badge badge-secondary'>{tag}</span>
                                </Link>
                            ))}
                        </div>
                        <div className='d-flex align-items-center'>
                            <i className='bx bxs-heart' />

                            <span>{abbreviate_number(track.likes_count)}</span>

                            <i className='bx bx-play' />
                            <span>{abbreviate_number(track.playback_count)}</span>

                            <i className='bx bx-repost' />
                            <span>{abbreviate_number(track.reposts_count)}</span>

                        </div>
                    </div>

                    {
                        track.description && (
                            <ToggleMore className='trackDescription'>
                                <Linkify
                                    text={track.description}
                                />
                            </ToggleMore>
                        )
                    }

                    {/* TODO ADD Spinner */}
                    {
                        comments && (
                            <CommentList
                                comments={comments.items}
                            />
                        )
                    }
                </div>
            </div>
        );
    }
}
