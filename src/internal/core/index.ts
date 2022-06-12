
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
	public handler: ParserHandler<T>;

	constructor(handler: ParserHandler<T>) {
		this.handler = handler;
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

	atLeast(n: number): Parser<any> {
		return new Parser((input, index, state) => {
			let result;
			let accum = [];
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
}

export const any = new Parser((input, index, state) => {
	if ((input.length - index) < 1) {
		return failure();
	}
	const value = input.charAt(index);
	return success(index + 1, value);
});

export const str = <T extends string>(value: T): Parser<T> => {
	return new Parser((input, index, state) => {
		if ((input.length - index) < value.length) {
			return failure();
		}
		if (input.substr(index, value.length) != value) {
			return failure();
		}
		return success(index + value.length, value);
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

type Syntax = (rules: any) => Parser<any>;

export function createLanguage<T extends Record<string, Syntax>>(syntaxes: T): Record<string, Parser<any>> {
	const rules: Record<string, Parser<any>> = {};
	for (const key of Object.keys(syntaxes)) {
		rules[key] = lazy(() => {
			return syntaxes[key](rules);
		});
	}
	return rules;
}
