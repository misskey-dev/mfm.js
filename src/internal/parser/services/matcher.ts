import { MfmNode } from '../../../node';
import { FullParserOpts } from '../index';
import { CacheItem } from './cache';
import { SyntaxId, SyntaxName } from './syntax';

export class Matcher<T> {
	public handler: MatcherHandler<T>;

	constructor(handler: MatcherHandler<T>) {
		this.handler = handler;
	}
}

export class SyntaxMatcher<T> extends Matcher<T> {
	public id: SyntaxId;

	constructor(id: SyntaxId, handler: (ctx: MatcherContext) => Match<T>) {
		super(handler);
		this.id = id;
		this.handler = handler;
	}
}

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

		let key = 0;
		if (matcher instanceof SyntaxMatcher) {
			key = SyntaxId.COUNT * this.pos + matcher.id;
			const cache = this.getCache<MatchResult<T>>(key);
			if (cache != null) {
				return this.ok(cache);
			}
		}

		if (this.debug && matcher instanceof SyntaxMatcher) {
			console.log(`${this.pos}\tenter ${SyntaxName[matcher.id]}`);
		}
		const match = matcher.handler(this);
		if (this.debug && matcher instanceof SyntaxMatcher) {
			console.log(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${SyntaxName[matcher.id]}`);
		}

		if (match.ok) {
			if (matcher instanceof SyntaxMatcher) {
				this.setCache(key, match.result);
			}
		}

		return match;
	}

	public tryConsume<T extends Matcher<MatchResult<T>>>(matcher: T, opts: MatcherOpts = {}): Match<MatchResult<T>> {
		const fallback = this.pos;

		let key = 0;
		if (matcher instanceof SyntaxMatcher) {
			key = SyntaxId.COUNT * this.pos + matcher.id;
			const cache = this.getCache<MatchResult<T>>(key);
			if (cache != null) {
				return this.ok(cache);
			}
		}

		if (this.debug && matcher instanceof SyntaxMatcher) {
			console.log(`${this.pos}\tenter ${SyntaxName[matcher.id]}`);
		}
		const match = matcher.handler(this);
		if (this.debug && matcher instanceof SyntaxMatcher) {
			console.log(`${fallback}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${SyntaxName[matcher.id]}`);
		}

		if (match.ok) {
			if (matcher instanceof SyntaxMatcher) {
				this.setCache(key, match.result);
			}
		} else {
			this.pos = fallback;
		}

		return match;
	}

	public tryConsumeAny<T extends Matcher<MatchResult<T>>>(matchers: T[], opts: MatcherOpts = {}): Match<MatchResult<T>> {
		for (const matcher of matchers) {
			const match = this.tryConsume(matcher, opts);
			if (match.ok) {
				return match;
			}
		}
		return this.fail();
	}

	// public match<T extends Matcher<MatchResult<T>>>(matcher: T, opts: MatcherOpts = {}): Match<MatchResult<T>> {
	// 	const storedPos = this.pos;
	// 	if (this.debug) console.log(`${this.pos}\tenter ${SyntaxName[matcher.id]}`);
	// 	const match = matcher.handler(this);
	// 	if (this.debug) console.log(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${SyntaxName[matcher.id]}`);
	// 	this.pos = storedPos;
	// 	return match;
	// }

	public matchCharCode(charCode: number): boolean {
		return this.input.charCodeAt(this.pos) == charCode;
	}

	public matchStr(value: string): boolean {
		return this.input.startsWith(value, this.pos);
	}

	public matchRegex(regex: RegExp): RegExpExecArray | null {
		return regex.exec(this.input.substr(this.pos));
	}

	private setCache(key: number, result: MfmNode): void {
		if (this.debug) {
			const pos = Math.floor(key / SyntaxId.COUNT);
			const id = key % SyntaxId.COUNT;
			console.log(`${pos}\t[set cache] ${SyntaxName[id]}`);
		}
		this.cache[key] = {
			pos: this.pos,
			result: result,
		};
	}

	private getCache<T extends MfmNode>(key: number): T | null {
		let id = 0;
		if (this.debug) {
			id = key % SyntaxId.COUNT;
		}
		if (this.cache[key] != null) {
			const cache = this.cache[key] as CacheItem<T>;
			if (this.debug) {
				console.log(`${this.pos}\t[hit cache] ${SyntaxName[id]}`);
			}
			this.pos = cache.pos;
			return cache.result;
		}
		if (this.debug) {
			console.log(`${this.pos}\t[miss cache] ${SyntaxName[id]}`);
		}
		return null;
	}
}
