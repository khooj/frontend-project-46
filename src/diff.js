const diff = (obj1, obj2) => {
	const result = [];
	const keysSet = new Set([Object.keys(obj1), Object.keys(obj2)].flat());
	const keys = [...keysSet].sort((a, b) => a.normalize().localeCompare(b.normalize()));

	for (const key of keys) {
		const contains1 = Object.hasOwn(obj1, key);
		const contains2 = Object.hasOwn(obj2, key);
		const el = {};
		if (contains1 && !contains2) {
			el.first = `- ${key}: ${obj1[key]}`;
		} else if (!contains1 && contains2) {
			el.second = `+ ${key}: ${obj2[key]}`;
		} else if (contains1 && contains2) {
			if (obj1[key] === obj2[key]) {
				el.equal = `  ${key}: ${obj1[key]}`;
			} else {
				el.first = `- ${key}: ${obj1[key]}`;
				el.second = `+ ${key}: ${obj2[key]}`;
			}
		}
		result.push(el);
	}

	return result;
};

const genDiff = (obj1, obj2) => {
	const diffs = diff(obj1, obj2);
	const result = diffs.flatMap((el) => {
		if (el.equal) {
			return [el.equal];
		}
		const r = [];
		if (el.first) {
			r.push(el.first);
		}
		if (el.second) {
			r.push(el.second);
		}
		return r;
	});

	return ['{', ...result.map((el) => '  ' + el), '}'].join('\n');
};

export {
	genDiff,
};