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

	public storePos() {
		this.locStack.unshift(this.pos);
	}

	public restorePos(): number {
		return this.locStack.shift()!;
	}

	public eof(): boolean {
		return this.pos >= this.input.length;
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
		// TODO: fix pos
		this.storePos();
		const matched = matcher(this);
		if (matched.ok) {
			this.pos += this.restorePos();
		} else {
			this.restorePos();
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
