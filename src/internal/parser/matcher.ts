export class MatcherContext {
	public input: string;
	private locStack: number[] = [];

	public state: {
		fnNameList: string[] | undefined;
		nestLimit: number;
		syntaxMatcher: Matcher;
		inlineSyntaxMatcher: Matcher;
	};

	public get pos() {
		return this.locStack[0];
	}

	public set pos(value: number) {
		this.locStack[0] = value;
	}

	constructor(input: string, state: MatcherContext['state']) {
		this.input = input;
		this.locStack = [0];
		this.state = state;
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
