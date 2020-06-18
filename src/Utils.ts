export class Utils {
	/**
	 * Removes duplicit elements of array. Duplicities in this case
	 * does not mean that two objects are deeply equal, but that
	 * both have specific property equal.
	 * @param array array that can contain duplicities
	 * @param property property name of object in the array
	 * @returns array without duplicities
	 */
	static removeDuplicityByProperty<T>(array: T[], property: keyof T): T[] {
		//can't use filter because we need to update the array while iterating
		const uniqueArray: T[] = [];
		array.forEach((object: T, index: number) => {
			if (
				uniqueArray.find((object2: T) => object[property] == object2[property]) == undefined
			) {
				uniqueArray.push(object);
			}
		});
		return uniqueArray;
	}
	/**
	 * Gets value of parameter from url
	 * @param url url that we want to get the parameter from
	 * @param paramName name of the parameter we want to get
	 * @returns value of a parameter or null if there is not any
	 */
	static getParamFromURL(url: string, paramName: string): string | null {
		if (url == "") throw new Error("empty URL");
		const params = new URLSearchParams(url.split("?")[1]);
		return params.get(paramName);
	}
}
