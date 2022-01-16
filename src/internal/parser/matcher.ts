export class MatcherContext<T> {
	public input: string;
	private locStack: number[] = [];

	public state: T;

	public get pos() {
		return this.locStack[0];
	}

	public set pos(value: number) {
		this.locStack[0] = value;
	}

	constructor(input: string, state: T) {
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

export type Matcher<T> = (ctx: MatcherContext<T>) => MatcherResult;
