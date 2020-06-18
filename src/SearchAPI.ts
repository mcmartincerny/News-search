export default class SearchAPI {
	/**
	 * Creates SearchAPI instance
	 * @param apiKey key to google search api
	 * @param searchEngineID google search api engine id
	 */
	constructor(private readonly apiKey: string, private readonly searchEngineID: string) {}

	/**
	 * Sends request to google for 10 results and subsets them.
	 * @param query search term
	 * @param startIndex index to start the search from
	 * @param image if we want image search or not
	 * @returns a promise with {@link SearchData}
	 */
	search(query: string, startIndex = 1, image = false): Promise<SearchData> {
		return new Promise((resolve, reject) => {
			let url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineID}&q=${query}&start=${startIndex}`;
			if (image) {
				url += "&searchType=image";
			}
			//fetches the data from google
			fetch(url)
				.then(
					(response: void | Response): Promise<any> => {
						if ((response as Response).status == 429) throw "rateLimitExceeded";
						if ((response as Response).ok == false) throw "serverError";
						return (response as Response).json();
					},
				)
				//makes a subset from the data
				.then((json) => {
					let results: Result[] = [];
					json.items?.forEach((item: any) => {
						const result: Result = {
							title: item.title,
							desc: item.snippet,
							link: item.image ? item.image.contextLink : null,
							displayLink: item.displayLink,
							sourceLink: item.link,
							thumbnailLink: item.image ? item.image.thumbnailLink : null,
						};
						results.push(result);
					});
					const data: SearchData = {
						totalResults: json.queries.request[0].totalResults,
						nextPageStartIndex: json.queries.nextPage
							? json.queries.nextPage[0].startIndex
							: 0,
						results: results,
					};
					resolve(data);
				})
				.catch((error: Error) => {
					reject(error);
				});
		});
	}
}
/**
 * Subset of data returned from google
 */
export interface SearchData {
	totalResults: number;
	results: Result[];
	nextPageStartIndex: number;
}

/**
 * Subset of one result from google
 */
export interface Result {
	title: string;
	desc: string;
	link: string;
	displayLink: string;
	sourceLink: string;
	thumbnailLink: string;
}
