import { FullParserOpts } from '../index';

export type Matcher<T> = (ctx: MatcherContext) => Match<T>;

export type Match<T> = MatchSuccess<T> | MatchFailure;

export type MatchSuccess<T> = {
	ok: true;
	result: T;
};

export type MatchFailure = {
	ok: false;
};

export type MatchResult<T> = T extends Matcher<infer R> ? R : any;

export type ConsumeOpts = Partial<{

}>;

export class MatcherContext {
	public input: string;
	public pos: number = 0;
	public cache: Record<string, any> = {};
	public fnNameList: string[] | undefined;
	public nestLimit: number;
	public depth: number = 0;

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

	public consume<T extends Matcher<MatchResult<T>>>(matcher: T, opts?: ConsumeOpts) {
		opts = opts || {};
		const matched = matcher(this);
		return matched;
	}

	public tryConsume<T extends Matcher<MatchResult<T>>>(matcher: T, opts?: ConsumeOpts) {
		opts = opts || {};
		const fallback = this.pos;
		const matched = matcher(this);
		if (!matched.ok) {
			this.pos = fallback;
		}
		return matched;
	}

	public match<T extends Matcher<MatchResult<T>>>(matcher: T) {
		const pos = this.pos;
		const matched = matcher(this);
		this.pos = pos;
		return matched;
	}
}
