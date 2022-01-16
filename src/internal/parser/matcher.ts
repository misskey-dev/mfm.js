export class MatcherContext {
	public input: string;
	public pos: number;
	public state: {
		fnNameList: string[] | undefined;
		nestLimit: number;
		syntaxMatcher: Matcher;
		inlineSyntaxMatcher: Matcher;
	};

	constructor(input: string, state: MatcherContext['state']) {
		this.input = input;
		this.state = state;
		this.pos = 0;
	}

	public ok(resultData: any): MatcherResult {
		return {
			ok: true,
			resultData: resultData,
		};
	}

	public fail(): MatcherResult {
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

export type MatcherResult = {
	ok: true;
	resultData: any;
} | {
	ok: false;
};

export type Matcher = (ctx: MatcherContext) => MatcherResult;
