import SearchAPI, { Result, SearchData } from "./searchAPI";
import { Utils } from "./Utils";

/**
 * SearchPage manages searching and displaying the search result
 */
export default class SearchPage {
	private readonly apiKey: string = "AIzaSyAEMLloROZuLfy8nrXmbgbeFNOBiUjaB2Y";
	private readonly searchEngineID: string = "015958362015637421762:gnropqwcrvc";
	private readonly searchAPI: SearchAPI;
	private webData: SearchData | undefined;
	private imageData: SearchData | undefined;
	private searchQuery: string | undefined;
	private webSearchRunning: boolean = true;
	private imageSearchRunning: boolean = true;

	/**
	 * Creates SearchPage instance
	 * @param resultDiv div that contains results of both web sites and images
	 * @param webResultDiv div that contains web results
	 * @param imageResultDiv div that contains image results
	 * @param loadingWheelWeb loading wheel on the bottom of web results
	 * @param loadingWheelImages loading wheel on the bottom of image results
	 */
	constructor(
		private readonly resultDiv: HTMLDivElement,
		private readonly webResultDiv: HTMLDivElement,
		private readonly imageResultDiv: HTMLDivElement,
		private readonly loadingWheelWeb: HTMLDivElement,
		private readonly loadingWheelImages: HTMLDivElement,
	) {
		this.searchAPI = new SearchAPI(this.apiKey, this.searchEngineID);
		this.hideResult();
	}

	/**
	 * Searches for the search term and displays the results
	 * @param searchText search term
	 * @param searchByUser if the user started the search with button or enter key
	 */
	public search(searchText: string, searchByUser?: boolean): void {
		this.hideResult();
		if (searchText.length == 0) return;
		this.imageResultDiv.innerHTML = "";
		this.webResultDiv.innerHTML = "";
		//shows the loading wheels
		this.loadingWheelWeb.hidden = false;
		this.loadingWheelImages.hidden = false;
		const query = encodeURI(searchText);
		this.searchQuery = query;
		//Modifies URL for to match this search for bookmark purposes and also saves it to history
		//Basically enables single page web app to work like other websites
		if (searchByUser) history.pushState(query, query, "?search=" + query);
		//Searches web pages
		this.handleSearch(query).then((webData) => {
			this.webData = webData;
			this.addWebs(this.webData.results);
			this.showResult();
		});
		//Searches images
		this.handleSearch(query, true).then((imageData) => {
			this.imageData = imageData;
			this.addImages(this.imageData.results);
			this.showResult();
		});
	}

	/**
	 * Handles the searching and processes exceptions
	 * @param query search term
	 * @param image if we want image search or not
	 * @param startIndex index to start the search from
	 * @returns a promise with {@link SearchData}
	 */
	private handleSearch(query: string, image?: boolean, startIndex?: number): Promise<SearchData> {
		return new Promise((resolve) => {
			this.searchAPI
				.search(query, startIndex, image)
				.then((data) => {
					if ((data as SearchData).totalResults > 0) {
						//Sometimes there are duplicities in the data, if there are two results
						//with the same title, the second one is removed
						data.results = Utils.removeDuplicityByProperty(data.results, "title");
						resolve(data as SearchData);
					} else {
						//there are not results for this search term
						alert("No " + (image ? "image" : "web") + " results for '" + query + "'");
						this.hideResult();
					}
				})
				.catch((error: Error | string) => {
					//checks if google search limit is not exceeded
					if (error == "rateLimitExceeded") {
						this.hideResult();
						alert("Reached maximum limit of queries for today. Try again tomorrow.");
						//checks if there are connection issues or server error
					} else if (error == "serverError") {
						this.hideResult();
						alert(
							"Check your internet connection. There might be a problem with google servers.",
						);
					} else {
						alert(
							"There was an unexpected error, please check the console for more information",
						);
						throw error;
					}
				})
				.finally(() => {
					if (image) {
						this.imageSearchRunning = false;
					} else {
						this.webSearchRunning = false;
					}
				});
		});
	}
	/**
	 * Manages the updating of the results. When called, it will send another requests
	 * to google search API and displays the result.
	 * @param loadImages if we want image search or not
	 */
	public loadMore(loadImages: boolean): void {
		const query = this.searchQuery!;
		if (loadImages) {
			//checks if there is not image search running - prevents fetching it more times
			if (this.imageSearchRunning) return;
			this.imageSearchRunning = true;
			//checks if there are more results
			if (
				this.imageData!.nextPageStartIndex != 0 &&
				this.imageData!.totalResults >= this.imageData!.nextPageStartIndex
			) {
				this.handleSearch(query, true, this.imageData!.nextPageStartIndex).then(
					(imageData) => {
						//saves new results and displayes them
						this.imageData!.nextPageStartIndex = imageData.nextPageStartIndex;
						this.imageData!.totalResults = imageData.totalResults;
						this.imageData!.results.push(...imageData.results);
						this.addImages(imageData.results);
					},
				);
			} else {
				//hides loading wheel if there are no more pages to load
				this.loadingWheelImages.hidden = true;
			}
		} else {
			//checks if there is not web search running - prevents fetching it more times
			if (this.webSearchRunning) return;
			this.webSearchRunning = true;
			//checks if there are more results
			if (
				this.webData!.nextPageStartIndex != 0 &&
				this.webData!.totalResults >= this.webData!.nextPageStartIndex
			) {
				this.handleSearch(query, false, this.webData!.nextPageStartIndex).then(
					(webData) => {
						//saves new results and displayes them
						this.webData!.nextPageStartIndex = webData.nextPageStartIndex;
						this.webData!.totalResults = webData.totalResults;
						this.webData!.results.push(...webData.results);
						this.addWebs(webData.results);
					},
				);
			} else {
				//hides loading wheel if there are no more pages to load
				this.loadingWheelWeb.hidden = true;
			}
		}
	}

	/**
	 * Creates image result elements and displays them
	 * @param results {@link SearchData} Images to display
	 */
	private addImages(results: Result[]): void {
		results.forEach((result: Result) => {
			const image = document.createElement("img");
			image.src = result.sourceLink;
			image.alt = result.title;
			image.className = "result-image-image";
			image.onerror = () => {
				//if the url of the image is not working (e.g. server is down)
				//it will use thumbnail that is on google servers
				image.src = result.thumbnailLink;
				//preventing endless loops in case of bad thumbnail
				image.onerror = null;
			};

			const title = document.createElement("div");
			title.className = "result-image-title";
			title.innerText = result.title;

			const anchor = document.createElement("a");
			anchor.className = "result-image";
			anchor.href = result.link;
			anchor.append(image);
			anchor.append(title);
			this.imageResultDiv.append(anchor);
		});
	}

	/**
	 * Creates web result elements and displays them
	 * @param results {@link SearchData} Webs to display
	 */
	private addWebs(results: Result[]): void {
		results.forEach((result: Result) => {
			const web = document.createElement("div");
			web.className = "web";
			web.onclick = (event: MouseEvent) => {
				location.href = result.sourceLink;
			};

			const title = document.createElement("div");
			title.className = "title";
			title.innerText = result.title;

			const simplifiedUrl = document.createElement("div");
			simplifiedUrl.className = "url";
			simplifiedUrl.innerText = result.displayLink;

			const desc = document.createElement("div");
			desc.className = "description";
			desc.innerText = result.desc;

			web.append(title);
			web.append(simplifiedUrl);
			web.append(desc);
			this.webResultDiv.append(web);
		});
	}

	/**
	 * hides result div
	 */
	private hideResult() {
		this.resultDiv.style.display = "none";
	}

	/**
	 * shows result div
	 */
	private showResult() {
		this.resultDiv.style.display = "";
	}
}
