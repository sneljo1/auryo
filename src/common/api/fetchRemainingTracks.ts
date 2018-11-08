import { RemainingPlays } from '../store/app';
import { asJson, SC, status } from '../utils';

interface JsonResponse {
    statuses: Array<Status>;
}

interface Status {
    rate_limit: {
        bucket: string;
        max_nr_of_requests: number;
        time_window: string;
        name: 'plays' | 'search'
    };
    remaining_requests: number;
    reset_time: string;
}

export default function fetchRemainingPlays(): Promise<RemainingPlays | null> {
    return fetch(SC.getRemainingTracks())
        .then(status)
        .then(asJson)
        .then((json: JsonResponse) => {
            if (json.statuses.length) {
                const plays = json.statuses.find((t) => t.rate_limit.name === 'plays');

                if (plays) {
                    return {
                        remaining: plays.remaining_requests,
                        resetTime: new Date(plays.reset_time).getTime()
                    };
                }
            }

            return null;

        });
}
