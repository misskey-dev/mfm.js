import { MfmNode } from '../../../node';
import { FullParserOpts } from '../index';
import { CacheItem, SyntaxId } from './cache';

export type Matcher<T> = (ctx: MatcherContext) => Match<T>;

export type Match<T> = MatchSuccess<T> | MatchFailure;

export type MatchSuccess<T> = {
	ok: true;
	result: T;
};

export type MatchFailure = {
	ok: false;
};

export type MatchResult<T> = T extends Matcher<infer R> ? R : never;

export type MatcherOpts = Partial<{

}>;

export class MatcherContext {
	public input: string;
	public pos = 0;
	public nestLimit: number;
	public depth = 0;
	public debug = false;
	public cache: Record<number, CacheItem<MfmNode> | null> = {};
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

	public consume<T extends Matcher<MatchResult<T>>>(matcher: T, opts: MatcherOpts = {}): Match<MatchResult<T>> {
		const storedPos = this.pos;
		if (this.debug) console.log(`${this.pos}\tenter ${matcher.name}`);
		const matched = matcher(this);
		if (this.debug) console.log(`${storedPos}:${this.pos}\t${matched.ok ? 'match' : 'fail'} ${matcher.name}`);
		return matched;
	}

	public tryConsume<T extends Matcher<MatchResult<T>>>(matcher: T, opts: MatcherOpts = {}): Match<MatchResult<T>> {
		const fallback = this.pos;
		if (this.debug) console.log(`${this.pos}\tenter ${matcher.name}`);
		const matched = matcher(this);
		if (this.debug) console.log(`${fallback}:${this.pos}\t${matched.ok ? 'match' : 'fail'} ${matcher.name}`);
		if (!matched.ok) {
			this.pos = fallback;
		}
		return matched;
	}

	public tryConsumeAny<T extends Matcher<MatchResult<T>>>(matchers: T[], opts: MatcherOpts = {}): Match<MatchResult<T>> {
		for (const matcher of matchers) {
			const matched = this.tryConsume(matcher, opts);
			if (matched.ok) {
				return matched;
			}
		}
		return this.fail();
	}

	public match<T extends Matcher<MatchResult<T>>>(matcher: T, opts: MatcherOpts = {}): Match<MatchResult<T>> {
		const storedPos = this.pos;
		if (this.debug) console.log(`${this.pos}\tenter ${matcher.name}`);
		const matched = matcher(this);
		if (this.debug) console.log(`${storedPos}:${this.pos}\t${matched.ok ? 'match' : 'fail'} ${matcher.name}`);
		this.pos = storedPos;
		return matched;
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

	public setCache(key: number, result: MfmNode, syntaxName: string): void {
		if (this.debug) {
			const pos = Math.floor(key / SyntaxId.COUNT);
			console.log(`${pos}\t[set cache] ${syntaxName}`);
		}
		this.cache[key] = {
			pos: this.pos,
			result: result,
		};
	}

	public getCache<T extends MfmNode>(key: number, syntaxName: string): T | null {
		if (this.cache[key] != null) {
			const cache = this.cache[key] as CacheItem<T>;
			if (this.debug) console.log(`${this.pos}\t[hit cache] ${syntaxName}`);
			this.pos = cache.pos;
			return cache.result;
		}
		if (this.debug) console.log(`${this.pos}\t[miss cache] ${syntaxName}`);
		return null;
	}
}
