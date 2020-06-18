import SearchAPI from "../src/SearchAPI";
describe("SearchAPI - search", () => {
	const seachAPI = new SearchAPI(
		"AIzaSyAEMLloROZuLfy8nrXmbgbeFNOBiUjaB2Y",
		"015958362015637421762:gnropqwcrvc",
	);

	it("search pizza", () => {
		seachAPI.search("pizza").then((data) => {
			expect(data.totalResults).toBeGreaterThan(0);
			expect(data.nextPageStartIndex).toEqual(11);
		});
	});

	it("search from index", () => {
		seachAPI.search("pizza", 71).then((data) => {
			expect(data.totalResults).toBeGreaterThan(0);
			expect(data.nextPageStartIndex).toEqual(81);
		});
	});

	it("search without any results", () => {
		seachAPI.search("skl8s4gf6hgf86s4nadf6j48f").then((data) => {
			expect(data.totalResults == 0).toBeTrue();
			expect(data.nextPageStartIndex).toEqual(11);
		});
	});
});
