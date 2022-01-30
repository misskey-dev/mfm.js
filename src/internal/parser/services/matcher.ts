import { FullParserOpts } from '../index';

export class Matcher<T> {
	public name = 'unnamed';

	public match(ctx: MatcherContext): Match<T> {
		return ctx.fail();
	}
}

export class CacheableMatcher<T> extends Matcher<T> {
	public cache: Record<number, CacheItem<T> | null> = {};
}

export function isCacheableMatcher<T>(x: Matcher<T>): x is CacheableMatcher<T> {
	return 'cache' in x;
}

export type CacheItem<T> = {
	pos: number;
	result: T;
};

export type Match<T> = MatchSuccess<T> | MatchFailure;

export type MatchSuccess<T> = {
	ok: true;
	result: T;
};

export type MatchFailure = {
	ok: false;
};

export type MatchResult<T> = T extends CacheableMatcher<infer R> ? R : never;

export class MatcherContext {
	public input: string;
	public pos = 0;
	public nestLimit: number;
	public depth = 0;
	public debug = false;
	public enableCache = true;
	// fn
	public fnNameList: string[] | undefined;
	// link
	public linkLabel = false;

	constructor(input: string, opts: FullParserOpts) {
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

	public consume<T extends Matcher<MatchResult<T>> | CacheableMatcher<MatchResult<T>>>(matcher: T): Match<MatchResult<T>> {
		const storedPos = this.pos;

		if (isCacheableMatcher(matcher) && this.enableCache) {
			const cache = matcher.cache[this.pos];
			if (cache != null) {
				if (this.debug) {
					console.log(`${this.pos}\t[hit cache] ${matcher.name}`);
				}
				this.pos = cache.pos;
				return this.ok(cache.result);
			}
			if (this.debug) {
				console.log(`${this.pos}\t[miss cache] ${matcher.name}`);
			}
		}

		if (this.debug) {
			console.log(`${this.pos}\tenter ${matcher.name}`);
		}
		const match = matcher.match(this);
		if (this.debug) {
			console.log(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${matcher.name}`);
		}

		if (match.ok) {
			if (isCacheableMatcher(matcher) && this.enableCache) {
				matcher.cache[storedPos] = { pos: this.pos, result: match.result };
				if (this.debug) {
					console.log(`${storedPos}\t[set cache] ${matcher.name}`);
				}
			}
		}

		return match;
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
}
