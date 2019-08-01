import { normalize, schema } from "normalizr";
import { NormalizedResponse, SoundCloud } from "../../types";
import { commentSchema } from "../schemas";
import fetchToJson from "./helpers/fetchToJson";

interface JsonResponse {
	collection: SoundCloud.Comment[];
	next_href?: string;
	future_href?: string;
}

export default async function fetchComments(
	url: string
): Promise<{
	json: JsonResponse;
	normalized: NormalizedResponse;
}> {
	try {
		const json = await fetchToJson<JsonResponse>(url)

		const { collection } = json;

		const n = normalize(
			collection,
			new schema.Array(
				{
					comments: commentSchema
				},
				input => `${input.kind}s`
			)
		);

		return {
			normalized: n,
			json
		};
	} catch (err) {
		throw err;
	}
}
