import { ParserOpts } from '../index';

export interface Matcher<T> {
	name: string;
	isCacheable: boolean;
	match: MatcherHandler<T>;
}

export function defineMatcher<T>(name: string, match: MatcherHandler<T>): Matcher<T> {
	return {
		name: name,
		isCacheable: false,
		match: match,
	};
}

export function defineCachedMatcher<T>(name: string, match: MatcherHandler<T>): Matcher<T> {
	return {
		name: name,
		isCacheable: true,
		match: match,
	};
}

export type CacheItem<T> = {
	pos: number;
	result: T;
};

export type MatcherHandler<T> = (ctx: MatcherContext) => Match<T>;

export type Match<T> = MatchSuccess<T> | MatchFailure;

export type MatchSuccess<T> = {
	ok: true;
	result: T;
};

export type MatchFailure = {
	ok: false;
};

export type MatchResult<T> = T extends Matcher<infer R> ? R : never;

export class MatcherContext {
	public input: string;
	public pos = 0;
	public nestLimit: number;
	public depth = 0;
	public debug = false;
	public cache: Map<string, Map<number, CacheItem<any>>> = new Map();
	public stack: Matcher<any>[] = [];
	// fn
	public fnNameList: string[] | undefined;

	constructor(input: string, opts: ParserOpts) {
		this.input = input;
		this.fnNameList = opts.fnNameList;
		this.nestLimit = opts.nestLimit || 20;
	}

	public ok<T>(result: T): MatchSuccess<T> {
		return {
			ok: true,
			result: result,
		};
	}

	public fail(): MatchFailure {
		return {
			ok: false,
		};
	}

	public eof(): boolean {
		return this.pos >= this.input.length;
	}

	public consume<T extends Matcher<MatchResult<T>>>(matcher: T): Match<MatchResult<T>> {
		const storedPos = this.pos;
		if (matcher.isCacheable) {
			// read cache
			let cacheTable = this.cache.get(matcher.name);
			if (cacheTable == null) {
				cacheTable = new Map();
				this.cache.set(matcher.name, cacheTable);
			}
			const cache: CacheItem<MatchResult<T>> | undefined = cacheTable.get(this.pos);
			if (cache != null) {
				this.debugLog(`${this.pos}\t[hit cache] ${matcher.name}`);
				this.pos = cache.pos;
				return this.ok(cache.result);
			}
			// match
			this.debugLog(`${this.pos}\tenter ${matcher.name}`);
			this.stack.unshift(matcher);
			const match = matcher.match(this);
			this.stack.shift();
			this.debugLog(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${matcher.name}`);
			// write cache
			if (match.ok) {
				cacheTable.set(storedPos, { pos: this.pos, result: match.result });
				this.debugLog(`${storedPos}\t[set cache] ${matcher.name}`);
			}
			return match;
		} else {
			this.debugLog(`${this.pos}\tenter ${matcher.name}`);
			this.stack.unshift(matcher);
			const match = matcher.match(this);
			this.stack.shift();
			this.debugLog(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${matcher.name}`);
			return match;
		}
	}

	public tryConsume<T extends Matcher<MatchResult<T>>>(matcher: T): Match<MatchResult<T>> {
		const storedPos = this.pos;
		const match = this.consume(matcher);
		if (!match.ok) {
			this.pos = storedPos; // fallback
		}
		return match;
	}

	public tryConsumeAny<T extends Matcher<MatchResult<T>>>(matchers: T[]): Match<MatchResult<T>> {
		for (const matcher of matchers) {
			const storedPos = this.pos;
			const match = this.consume(matcher);
			if (match.ok) {
				return match;
			}
			this.pos = storedPos; // fallback
		}

		return this.fail();
	}

	public match<T extends Matcher<MatchResult<T>>>(matcher: T): Match<MatchResult<T>> {
		const storedPos = this.pos;
		const match = this.consume(matcher);
		this.pos = storedPos;

		return match;
	}

	public matchCharCode(charCode: number): boolean {
		return this.input.charCodeAt(this.pos) == charCode;
	}

	public matchStr(value: string): boolean {
		return this.input.startsWith(value, this.pos);
	}

	public matchRegex(regex: RegExp): RegExpExecArray | null {
		return regex.exec(this.input.substr(this.pos));
	}

	private debugLog(log: string): void {
		if (this.debug) {
			console.log(log);
		}
	}
}
