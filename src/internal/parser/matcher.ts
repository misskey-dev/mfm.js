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
		return this.input.substr(this.locStack[0]);
	}

	public push() {
		this.locStack.unshift(this.locStack[0]);
	}

	public pop(): number {
		return this.locStack.shift()!;
	}

	public eof(): boolean {
		return this.locStack[0] >= this.input.length;
	}

	public ok(data: any): MatcherResult {
		return {
			ok: true,
			data: data,
		};
	}

	public fail(): MatcherResult {
		return {
			ok: false,
		};
	}

	public tryConsume(matcher: Matcher): MatcherResult {
		this.push();
		const matched = matcher(this);
		const length = this.pop();
		if (matched.ok) {
			this.pos += length;
		}
		return matched;
	}
}

export type MatcherResult = {
	ok: true;
	data: any;
} | {
	ok: false;
};

export type Matcher = (ctx: MatcherContext) => MatcherResult;
