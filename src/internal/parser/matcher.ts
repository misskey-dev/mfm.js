export class MatcherContext {
	public input: string;
	private locStack: number[] = [];

	constructor(input: string) {
		this.input = input;
		this.locStack = [0];
	}

	public get pos() {
		return this.locStack[0];
	}

	public set pos(value: number) {
		this.locStack[0] = value;
	}

	public getText(): string {
		return this.input.substr(this.pos);
	}

	public eof(): boolean {
		return this.pos >= this.input.length;
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
}

export type MatcherResult = {
	ok: true;
	resultData: any;
} | {
	ok: false;
};

export type Matcher = (ctx: MatcherContext) => MatcherResult;
