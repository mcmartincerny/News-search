import { Utils } from "../src/Utils";

describe("Utils - removeDuplicityByProperty", () => {
	it("empty array", () => {
		const array: any = [];
		const result = Utils.removeDuplicityByProperty(array, "x");
		expect(result).toEqual([]);
	});

	it("unique array", () => {
		const array = [
			{ x: 5, y: 3 },
			{ x: 1, y: 9 },
			{ x: 2, y: 4 },
			{ x: 11, y: 32 },
		];
		const result = Utils.removeDuplicityByProperty(array, "y");
		expect(result).toEqual([
			{ x: 5, y: 3 },
			{ x: 1, y: 9 },
			{ x: 2, y: 4 },
			{ x: 11, y: 32 },
		]);
	});

	it("array with duplicity", () => {
		const array = [
			{ x: 5, y: 3 },
			{ x: 1, y: 9 },
			{ x: 2, y: 9 },
			{ x: 11, y: 32 },
		];
		const result = Utils.removeDuplicityByProperty(array, "y");
		expect(result).toEqual([
			{ x: 5, y: 3 },
			{ x: 1, y: 9 },
			{ x: 11, y: 32 },
		]);
	});
});

describe("Utils - getParamFromURL", () => {
	it("empty url", () => {
		const url = "";
		const param = "";
		expect(() => Utils.getParamFromURL(url, param)).toThrow(new Error("empty URL"));
	});

	it("non existing param", () => {
		const url = "www.example.com?param1=x&param2=y";
		const param = "param7";
		const result = Utils.getParamFromURL(url, param);
		expect(result).toEqual(null);
	});

	it("existing param", () => {
		const url = "www.example.com?param1=x&param2=y";
		const param = "param1";
		const result = Utils.getParamFromURL(url, param);
		expect(result).toEqual("x");
	});
});
