import { createSyntaxMatcher, SyntaxLevel } from './index';

export class MatcherContext {
	public input: string;
	public pos: number;
	public state: {
		fnNameList: string[] | undefined;
		nestLimit: number;
		plainMatcher: ReturnType<typeof createSyntaxMatcher>;
		inlineMatcher: ReturnType<typeof createSyntaxMatcher>;
		fullMatcher: ReturnType<typeof createSyntaxMatcher>;
	};

	constructor(input: string, state: MatcherContext['state']) {
		this.input = input;
		this.state = state;
		this.pos = 0;
	}

	public ok<T>(resultData: T): MatcherSuccess<T> {
		return {
			ok: true,
			resultData: resultData,
		};
	}

	public fail(): MatcherFailure {
		return {
			ok: false,
		};
	}

	public eof(): boolean {
		return this.pos >= this.input.length;
	}

	public getText(): string {
		return this.input.substr(this.pos);
	}
}

export type MatcherSuccess<T> = {
	ok: true;
	resultData: T;
};

export type MatcherFailure = {
	ok: false;
};

export type MatcherResult<T> = MatcherSuccess<T> | MatcherFailure;

export type Matcher<T> = (ctx: MatcherContext) => MatcherResult<T>;

export function createContext(input: string, opts: Partial<{ fnNameList: string[]; nestLimit: number; }>) {
	return new MatcherContext(input, {
		fnNameList: opts.fnNameList,
		nestLimit: opts.nestLimit || 20,
		plainMatcher: createSyntaxMatcher(SyntaxLevel.plain),
		inlineMatcher: createSyntaxMatcher(SyntaxLevel.inline),
		fullMatcher: createSyntaxMatcher(SyntaxLevel.full),
	});
}
