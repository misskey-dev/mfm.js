
type Success<T> = {
	success: true;
	value: T;
	index: number;
};

type Failure = { success: false };

type Reply<T> = Success<T> | Failure;

type ParserHandler<T> = (input: string, index: number, state: any) => Reply<T>

export function success<T>(index: number, value: T): Success<T> {
	return {
		success: true,
		value: value,
		index: index,
	};
}

export function failure(): Failure {
	return { success: false };
}

export class Parser<T> {
	public name?: string;
	public handler: ParserHandler<T>;

	constructor(handler: ParserHandler<T>, name?: string) {
		this.handler = (input, index, state) => {
			if (state.trace && this.name != null) {
				const pos = `${index}`;
				console.log(`${pos.padEnd(6, ' ')}enter ${this.name}`);
				const result = handler(input, index, state);
				if (result.success) {
					const pos = `${index}:${result.index}`;
					console.log(`${pos.padEnd(6, ' ')}match ${this.name}`);
				} else {
					const pos = `${index}`;
					console.log(`${pos.padEnd(6, ' ')}fail ${this.name}`);
				}
				return result;
			}
			return handler(input, index, state);
		}
		this.name = name;
	}

	map<U>(fn: (value: T) => U): Parser<U> {
		return new Parser((input, index, state) => {
			const result = this.handler(input, index, state);
			if (!result.success) {
				return result;
			}
			return success(result.index, fn(result.value));
		});
	}

	atLeast(n: number): Parser<T[]> {
		return new Parser((input, index, state) => {
			let result;
			const accum: T[] = [];
			while (index < input.length) {
				result = this.handler(input, index, state);
				if (!result.success) {
					break;
				}
				index = result.index;
				accum.push(result.value);
			}
			if (accum.length < n) {
				return failure();
			}
			return success(index, accum);
		});
	}

	sep1(separator: Parser<any>): Parser<T[]> {
		return seq([
			this,
			seq([
				separator,
				this,
			], 1).atLeast(0),
		]).map(result => [result[0], ...result[1]]);
	}
}

export const any = new Parser((input, index, state) => {
	if ((input.length - index) < 1) {
		return failure();
	}
	const value = input.charAt(index);
	return success(index + 1, value);
});

export function succeeded<T>(value: T): Parser<T> {
	return new Parser((input, index, state) => {
		return success(index, value);
	});
}

export const str = <T extends string>(value: T): Parser<T> => {
	return new Parser((input, index, state) => {
		if ((input.length - index) < value.length) {
			return failure();
		}
		if (input.substr(index, value.length) !== value) {
			return failure();
		}
		return success(index + value.length, value);
	});
};

export const regexp = <T extends RegExp>(pattern: T): Parser<string> => {
	const re = RegExp(`^${pattern.source}`, pattern.flags);
	return new Parser((input, index, state) => {
		const result = re.exec(input.slice(index));
		if (result == null) {
			return failure();
		}
		return success(index + result[0].length, result[0]);
	});
};

export const seq = (parsers: Parser<any>[], select?: number): Parser<any> => {
	return new Parser((input, index, state) => {
		let result;
		const accum = [];
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, index, state);
			if (!result.success) {
				return result;
			}
			index = result.index;
			accum.push(result.value);
		}
		return success(index, select != null ? accum[select] : accum);
	});
};

/**
 * Partially consumes the sequence.
*/
export function seqPartial(parsers: Parser<any>[]): Parser<any[]> {
	return new Parser<any[]>((input, index, state) => {
		const accum: any[] = [];
		let latestIndex = index;
		for (let i = 0 ; i < parsers.length; i++) {
			const result = parsers[i].handler(input, latestIndex, state);
			if (!result.success) {
				return latestIndex !== index ? success(latestIndex, accum) : failure();
			}
			accum.push(result.value);
			latestIndex = result.index;
		}
		return success(latestIndex, accum);
	});
}

export const alt = (parsers: Parser<any>[]): Parser<any> => {
	return new Parser((input, index, state) => {
		let result;
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, index, state);
			if (result.success) {
				return result;
			}
		}
		return failure();
	});
};

export function option<T>(parser: Parser<T>): Parser<T | null> {
	return alt([
		parser,
		succeeded(null),
	]);
}

export const match = (parser: Parser<any>): Parser<null> => {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return result.success
			? success(index, null)
			: failure();
	});
};

export const notMatch = (parser: Parser<any>): Parser<null> => {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return !result.success
			? success(index, null)
			: failure();
	});
};

export const lazy = <T>(fn: () => Parser<T>): Parser<T> => {
	const parser: Parser<T> = new Parser((input, index, state) => {
		parser.handler = fn().handler;
		return parser.handler(input, index, state);
	});
	return parser;
};

type Syntax = (rules: Record<string, Parser<any>>) => Parser<any>;

export function createLanguage<T extends Record<string, Syntax>>(syntaxes: T): Record<string, Parser<any>> {
	const rules: Record<string, Parser<any>> = {};
	for (const key of Object.keys(syntaxes)) {
		rules[key] = lazy(() => {
			const parser = syntaxes[key](rules);
			parser.name = key;
			return parser;
		});
	}
	return rules;
}
