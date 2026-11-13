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

type StateKey = number;

interface State {
	trace?: boolean,
	linkLabel?: boolean,
	untilSpans?: Map<Parser<unknown>, Map<string, { start: number, end: number }>>,
	manyThenFailures?: Map<Parser<unknown>, Map<string, Map<StateKey, Set<number>>>>,
	nestLimit: number,
	nestBudget?: number,
	depth: number,
}

export type ParserHandler<T> = (input: string, index: number, state: State) => Result<T>;

export function success<T>(index: number, value: T): Success<T> {
	return {
		success: true,
		value: value,
		index: index,
	};
}

// Failures carry no data, so a single frozen instance is shared.
const FAILURE: Failure = Object.freeze({ success: false });

export function failure(): Failure {
	return FAILURE;
}

export class Parser<T> {
	public name?: string;
	public handler: ParserHandler<T>;
	// the characters the parser can start with (see `first`)
	public firstChars?: string;

	constructor(handler: ParserHandler<T>, name?: string) {
		this.handler = handler;
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

	many(min: number): Parser<T[]> {
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
			if (accum.length < min) {
				return failure();
			}
			return success(latestIndex, accum);
		});
	}

	sep(separator: Parser<unknown>, min: number): Parser<T[]> {
		if (min < 1) {
			throw new Error('"min" must be a value greater than or equal to 1.');
		}
		return seq(
			this,
			seq(
				separator,
				this,
			).select(1).many(min - 1),
		).map(result => [result[0], ...result[1]]);
	}

	select<K extends keyof T>(key: K): Parser<T[K]> {
		return this.map(v => v[key]);
	}

	option(): Parser<T | null> {
		// same as `alt([this, succeeded(null)])`
		return new Parser<T | null>((input, index, state) => {
			const result = this.handler(input, index, state);
			return result.success ? result : success(index, null);
		});
	}
}

export function str<T extends string>(value: T): Parser<T> {
	// most attempts fail at the first code unit, so it is checked before comparing the whole value
	const firstCode = value.charCodeAt(0);
	if (value.length === 1) {
		return new Parser((input, index, _state) => {
			if (input.charCodeAt(index) !== firstCode) {
				return failure();
			}
			return success(index + 1, value);
		});
	}
	return new Parser((input, index, _state) => {
		if (input.charCodeAt(index) !== firstCode || !input.startsWith(value, index)) {
			return failure();
		}
		return success(index + value.length, value);
	});
}

export function regexp<T extends RegExp>(pattern: T): Parser<string> {
	// Use the sticky flag to match at `index` without slicing the input.
	const re = RegExp(`(?:${pattern.source})`, pattern.flags.replace('g', '') + 'y');
	return new Parser((input, index, _state) => {
		// `test` does not allocate a match array; a sticky match starts at `index` and ends at `lastIndex`.
		re.lastIndex = index;
		if (!re.test(input)) {
			return failure();
		}
		return success(re.lastIndex, input.slice(index, re.lastIndex));
	});
}

type ParsedType<T extends Parser<unknown>> = T extends Parser<infer U> ? U : never;

export type SeqParseResult<T extends unknown[]> =
	T extends [] ? [] 
	: T extends [infer F, ...infer R]
		? (
			F extends Parser<unknown> ? [ParsedType<F>, ...SeqParseResult<R>] : [unknown, ...SeqParseResult<R>]
		)
		: unknown[];

export function seq<Parsers extends Parser<unknown>[]>(...parsers: Parsers): Parser<SeqParseResult<Parsers>> {
	return new Parser((input, index, state) => {
		// most attempts fail at the first parser, so the array is made after it
		let result = parsers[0].handler(input, index, state);
		if (!result.success) {
			return result;
		}
		let latestIndex = result.index;
		const accum = [result.value];
		for (let i = 1; i < parsers.length; i++) {
			result = parsers[i].handler(input, latestIndex, state);
			if (!result.success) {
				return result;
			}
			latestIndex = result.index;
			accum.push(result.value);
		}
		return success(latestIndex, accum as SeqParseResult<Parsers>);
	});
}

export function alt<Parsers extends Parser<unknown>[]>(parsers: Parsers): Parser<ParsedType<Parsers[number]>> {
	// parsers made by `first` are tried only at the characters they can start with
	const candidatesByChar = parsers.some(parser => parser.firstChars != null) ? new Map<number, Parsers[number][]>() : null;
	return new Parser<ParsedType<Parsers[number]>>((input, index, state): Result<ParsedType<Parsers[number]>> => {
		let candidates: Parsers[number][] = parsers;
		if (candidatesByChar != null) {
			// non-ascii characters share an entry
			const code = index < input.length ? Math.min(input.charCodeAt(index), 0x80) : -1;
			let cached = candidatesByChar.get(code);
			if (cached === undefined) {
				cached = parsers.filter(parser => parser.firstChars == null || (code >= 0 && parser.firstChars.includes(String.fromCharCode(code))));
				candidatesByChar.set(code, cached);
			}
			candidates = cached;
		}
		for (let i = 0; i < candidates.length; i++) {
			const parser: Parsers[number] = candidates[i];
			const result = parser.handler(input, index, state);
			if (result.success) {
				return result as Result<ParsedType<Parsers[number]>>;
			}
		}
		return failure();
	});
}

/**
 * Declares that `parser` can only match at one of the ascii characters `chars`.
 * `alt` uses this to skip the parser at other characters.
*/
export function first<T>(chars: string, parser: Parser<T>): Parser<T> {
	const guarded = new Parser<T>((input, index, state) => {
		if (index >= input.length || !chars.includes(input.charAt(index))) {
			return failure();
		}
		return parser.handler(input, index, state);
	});
	guarded.firstChars = chars;
	return guarded;
}

export function notMatch(parser: Parser<unknown>): Parser<null> {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return !result.success
			? success(index, null)
			: failure();
	});
}

function getOrCreate<K, V>(map: Map<K, V>, key: K, create: () => V): V {
	let value = map.get(key);
	if (value === undefined) {
		value = create();
		map.set(key, value);
	}
	return value;
}

// must cover every part of the state that a parse result depends on
function stateKey(state: State): StateKey {
	return state.depth * 2 + (state.linkLabel ? 1 : 0);
}

/**
 * Same as `seq(notMatch(terminator), char).select(1).many(min).text()`, caching the last scanned span per input.
 * `terminator` must not depend on the state.
*/
export function until(terminator: Parser<unknown>, min: number): Parser<string> {
	const parser: Parser<string> = new Parser((input, index, state) => {
		state.untilSpans ??= new Map();
		const spans = getOrCreate(state.untilSpans, parser, () => new Map());
		const span = spans.get(input);
		let end: number;
		if (span != null && span.start <= index && index <= span.end) {
			end = span.end;
		} else {
			end = index;
			while (end < input.length && !terminator.handler(input, end, state).success) {
				end++;
			}
			spans.set(input, { start: index, end });
		}
		if (end - index < min) {
			return failure();
		}
		return success(end, input.slice(index, end));
	});
	return parser;
}

/**
 * Same as `seq(seq(notMatch(stop), item).select(1).many(min), after)`, caching the item boundaries that lead to a failure.
 * `item`, `stop` and `after` must depend only on the input, the position and `stateKey`.
*/
export function manyThen<T, U>(item: Parser<T>, stop: Parser<unknown>, after: Parser<U>, min: number): Parser<[T[], U]> {
	const element = seq(notMatch(stop), item).select(1);
	const parser: Parser<[T[], U]> = new Parser((input, index, state) => {
		state.manyThenFailures ??= new Map();
		const byInput = getOrCreate(state.manyThenFailures, parser, () => new Map());
		const byState = getOrCreate(byInput, input, () => new Map());
		const failures = getOrCreate(byState, stateKey(state), () => new Set());
		const boundaries: number[] = [];
		const items: T[] = [];
		let latestIndex = index;
		while (!failures.has(latestIndex)) {
			boundaries.push(latestIndex);
			if (latestIndex >= input.length) {
				break;
			}
			const result = element.handler(input, latestIndex, state);
			if (!result.success) {
				break;
			}
			items.push(result.value);
			latestIndex = result.index;
		}
		if (items.length < min) {
			return failure();
		}
		const afterResult = failures.has(latestIndex) ? failure() : after.handler(input, latestIndex, state);
		if (!afterResult.success) {
			for (const boundary of boundaries) {
				failures.add(boundary);
			}
			return failure();
		}
		return success(afterResult.index, [items, afterResult.value]);
	});
	return parser;
}

export const cr = str('\r');
export const lf = str('\n');
export const crlf = str('\r\n');
// Same as `alt([crlf, cr, lf])`, checked by char codes since newlines are tested at almost every position.
export const newline = new Parser<'\r\n' | '\r' | '\n'>((input, index, _state) => {
	const code = input.charCodeAt(index);
	if (code === 0x0d) {
		return (input.charCodeAt(index + 1) === 0x0a)
			? success(index + 2, '\r\n')
			: success(index + 1, '\r');
	}
	if (code === 0x0a) {
		return success(index + 1, '\n');
	}
	return failure();
});

export const char = new Parser((input, index, _state) => {
	if ((input.length - index) < 1) {
		return failure();
	}
	const value = input.charAt(index);
	return success(index + 1, value);
});

export function isNewLineCode(code: number): boolean {
	return code === 0x0d || code === 0x0a;
}

export const lineBegin = new Parser((input, index, _state) => {
	if (index === 0 || isNewLineCode(input.charCodeAt(index - 1))) {
		return success(index, null);
	}
	return failure();
});

export const lineEnd = new Parser((input, index, _state) => {
	if (index === input.length || isNewLineCode(input.charCodeAt(index))) {
		return success(index, null);
	}
	return failure();
});

export function lazy<T>(fn: () => Parser<T>): Parser<T> {
	const parser: Parser<T> = new Parser((input, index, state) => {
		parser.handler = fn().handler;
		return parser.handler(input, index, state);
	});
	return parser;
}

//type Syntax<T> = (rules: Record<string, Parser<T>>) => Parser<T>;
//type SyntaxReturn<T> = T extends (rules: Record<string, Parser<any>>) => infer R ? R : never;
//export function createLanguage2<T extends Record<string, Syntax<any>>>(syntaxes: T): { [K in keyof T]: SyntaxReturn<T[K]> } {

type ParserTable<T> = { [K in keyof T]: Parser<T[K]> };

// logs the calls of the parser when `state.trace` is set
function traced<T>(parser: Parser<T>, name: string): Parser<T> {
	return new Parser((input, index, state) => {
		if (!state.trace) {
			return parser.handler(input, index, state);
		}
		const pos = `${index}`;
		console.log(`${pos.padEnd(6, ' ')}enter ${name}`);
		const result = parser.handler(input, index, state);
		if (result.success) {
			const pos = `${index}:${result.index}`;
			console.log(`${pos.padEnd(6, ' ')}match ${name}`);
		} else {
			const pos = `${index}`;
			console.log(`${pos.padEnd(6, ' ')}fail ${name}`);
		}
		return result;
	}, name);
}

// TODO: 関数の型宣言をいい感じにしたい
export function createLanguage<T>(syntaxes: { [K in keyof T]: (r: ParserTable<T>) => Parser<T[K]> }): ParserTable<T> {
	// @ts-expect-error initializing object so type error here
	const rules: ParserTable<T> = {};
	for (const key of Object.keys(syntaxes) as (keyof T & string)[]) {
		rules[key] = lazy(() => {
			const parser = syntaxes[key](rules);
			// oxlint-disable-next-line typescript/no-unnecessary-condition -- the types rule out null, but a caller without types can still return nothing
			if (parser == null) {
				throw new Error('syntax must return a parser.');
			}
			return traced(parser, key);
		});
	}
	return rules;
}
