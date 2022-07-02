//
// Parsimmon-like stateful parser combinators
//

export type Success<T> = {
	success: true;
	value: T;
	index: number;
};

export type Failure = { success: false };

export type Result<T> = Success<T> | Failure;

export type ParserHandler<T> = (input: string, index: number, state: any) => Result<T>

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
		};
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

	text(): Parser<string> {
		return new Parser((input, index, state) => {
			const result = this.handler(input, index, state);
			if (!result.success) {
				return result;
			}
			const text = input.slice(index, result.index);
			return success(result.index, text);
		});
	}

	atLeast(n: number): Parser<T[]> {
		return new Parser((input, index, state) => {
			let result;
			let latestIndex = index;
			const accum: T[] = [];
			while (latestIndex < input.length) {
				result = this.handler(input, latestIndex, state);
				if (!result.success) {
					break;
				}
				latestIndex = result.index;
				accum.push(result.value);
			}
			if (accum.length < n) {
				return failure();
			}
			return success(latestIndex, accum);
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

export function succeeded<T>(value: T): Parser<T> {
	return new Parser((_input, index, _state) => {
		return success(index, value);
	});
}

export function str<T extends string>(value: T): Parser<T> {
	return new Parser((input, index, _state) => {
		if ((input.length - index) < value.length) {
			return failure();
		}
		if (input.substr(index, value.length) !== value) {
			return failure();
		}
		return success(index + value.length, value);
	});
}

export function regexp<T extends RegExp>(pattern: T): Parser<string> {
	const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
	return new Parser((input, index, _state) => {
		const text = input.slice(index);
		const result = re.exec(text);
		if (result == null) {
			return failure();
		}
		return success(index + result[0].length, result[0]);
	});
}

export function seq(parsers: Parser<any>[], select?: number): Parser<any> {
	return new Parser((input, index, state) => {
		let result;
		let latestIndex = index;
		const accum = [];
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, latestIndex, state);
			if (!result.success) {
				return result;
			}
			latestIndex = result.index;
			accum.push(result.value);
		}
		return success(latestIndex, (select != null ? accum[select] : accum));
	});
}

export function alt(parsers: Parser<any>[]): Parser<any> {
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
}

export function option<T>(parser: Parser<T>): Parser<T | null> {
	return alt([
		parser,
		succeeded(null),
	]);
}

export function notMatch(parser: Parser<any>): Parser<null> {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return !result.success
			? success(index, null)
			: failure();
	});
}

export function lazy<T>(fn: () => Parser<T>): Parser<T> {
	const parser: Parser<T> = new Parser((input, index, state) => {
		parser.handler = fn().handler;
		return parser.handler(input, index, state);
	});
	return parser;
}

export const cr = str('\r');
export const lf = str('\n');
export const crlf = str('\r\n');

export const any = new Parser((input, index, _state) => {
	if ((input.length - index) < 1) {
		return failure();
	}
	const value = input.charAt(index);
	return success(index + 1, value);
});

export const lineBegin = new Parser((input, index, state) => {
	if (index === 0) {
		return success(index, null);
	}
	if (cr.handler(input, index - 1, state).success) {
		return success(index, null);
	}
	if (lf.handler(input, index - 1, state).success) {
		return success(index, null);
	}
	return failure();
});

export const lineEnd = new Parser((input, index, state) => {
	if (index === input.length) {
		return success(index, null);
	}
	if (cr.handler(input, index, state).success) {
		return success(index, null);
	}
	if (lf.handler(input, index, state).success) {
		return success(index, null);
	}
	return failure();
});

type Syntax<T> = (rules: Record<string, Parser<any>>) => Parser<T>;
type SyntaxReturn<T> = T extends (rules: Record<string, Parser<any>>) => infer R ? R : never;

export function createLanguage<T extends Record<string, Syntax<any>>>(syntaxes: T): { [K in keyof T]: SyntaxReturn<T[K]> } {
	const rules: Record<string, Parser<any>> = {};
	for (const key of Object.keys(syntaxes)) {
		rules[key] = lazy(() => {
			const parser = syntaxes[key](rules);
			parser.name = key;
			return parser;
		});
	}
	return rules as { [K in keyof T]: SyntaxReturn<T[K]> };
}
