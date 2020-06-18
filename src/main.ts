import SearchPage from "./SearchPage";
import { Utils } from "./Utils";

window.onload = () => {
	const resultDiv = document.querySelector(".result") as HTMLDivElement;
	const searchInput = document.querySelector(".search-input") as HTMLInputElement;
	const searchButton = document.querySelector(".search-button") as HTMLButtonElement;
	const imageResultDiv = document.querySelector(".result-images") as HTMLDivElement;
	const webResultDiv = document.querySelector(".result-webs") as HTMLDivElement;
	const loadingWheelWeb = document.querySelector(".load-webs") as HTMLDivElement;
	const loadingWheelImage = document.querySelector(".load-images") as HTMLDivElement;

	//Instantiate SearchPage
	const searchPage = new SearchPage(
		resultDiv,
		webResultDiv,
		imageResultDiv,
		loadingWheelWeb,
		loadingWheelImage,
	);

	//adds event listeners for button click and hitting enter on search input and starts the search
	searchButton.addEventListener("click", () => searchPage.search(searchInput.value, true));
	searchInput.addEventListener("keypress", (e: KeyboardEvent) => {
		if (e.key == "Enter") {
			searchPage.search(searchInput.value, true);
		}
	});

	//gets parameter search from URL of the page and if there is a search parameter
	//with a value, it will start the search with this value
	const searchString = Utils.getParamFromURL(location.href, "search");
	if (searchString) {
		searchInput.value = searchString;
		searchPage.search(searchString);
	}

	//If user navigates through the page history (for example the back button) it will start search
	window.onpopstate = (event: PopStateEvent) => searchPage.search(event.state);

	//creates observer that will observe registred elements and calls the callback function
	//whenever the registred elements enters or exits the viewport (screen)
	const observer = new IntersectionObserver(
		(loadingWheels) => {
			loadingWheels.forEach((wheel) => {
				if (wheel.isIntersecting) {
					searchPage.loadMore(wheel.target == loadingWheelImage);
				}
			});
		},
		{ threshold: [0] },
	);

	//registering the two loading wheels to observer
	observer.observe(loadingWheelWeb);
	observer.observe(loadingWheelImage);
};
