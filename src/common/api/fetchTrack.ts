import { normalize } from "normalizr";
import { NormalizedResponse, SoundCloud } from "../../types";
import { trackSchema } from "../schemas";
import { SC } from "../utils";
import fetchToJson from "./helpers/fetchToJson";

type JsonResponse = SoundCloud.Track;

export default async function fetchTrack(
	trackId: number
): Promise<{
	json: JsonResponse;
	normalized: NormalizedResponse;
}> {
	try {
		const json = await fetchToJson<JsonResponse>(SC.getTrackUrl(trackId));

		const normalized = normalize(json, trackSchema);

		return {
			normalized,
			json
		};
	} catch (err) {
		throw err;
	}
}
