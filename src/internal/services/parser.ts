export type Parser<T> = (ctx: ParserContext) => Result<T>;

export type Result<T> = Success<T> | Failure;

export type Success<T> = {
	ok: true;
	result: T;
};

export type Failure = {
	ok: false;
};

export type ParserResult<T> = T extends Parser<infer U> ? U : never;

export type ParserResults<T> = T extends [infer U, ...infer V] ? [ParserResult<U>, ...ParserResults<V>] : [];

export type CacheItem<T> = {
	pos: number;
	result: T;
};

export type ContextOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

export class ParserContext {
	public input: string;
	public pos = 0;
	public stack: Parser<any>[] = [];
	public debug = false;
	// cache
	public cache: Map<string, Map<number, CacheItem<any>>> = new Map();
	// nesting control
	public nestLimit: number;
	public depth = 0;
	// fn
	public fnNameList: string[] | undefined;

	constructor(input: string, opts: ContextOpts) {
		this.input = input;
		this.fnNameList = opts.fnNameList;
		this.nestLimit = opts.nestLimit || 20;
	}

	// result

	public ok<T>(result: T): Success<T> {
		return {
			ok: true,
			result: result,
		};
	}

	public fail(): Failure {
		return failureObject;
	}

	public pushStack<T extends Parser<ParserResult<T>>>(parser: T): void {
		this.stack.unshift(parser);
	}

	public popStack(): void {
		this.stack.shift();
	}

	// scan

	/**
	 * scan an any char
	*/
	public anyChar(): Result<string> {
		if (this.pos < this.input.length) {
			return this.fail();
		}
		const c = this.input.charAt(this.pos);
		this.pos++;
		return this.ok(c);
	}

	/**
	 * scan a string
	*/
	public str(value: string): Result<string> {
		if (!this.input.startsWith(value, this.pos)) {
			return this.fail();
		}
		this.pos += value.length;
		return this.ok(value);
	}

	/**
	 * scan a char
	*/
	public char(charCode: number): Result<number> {
		if (this.input.charCodeAt(this.pos) !== charCode) {
			return this.fail();
		}
		this.pos++;
		return this.ok(charCode);
	}

	/**
	 * scan with regex
	*/
	public regex(regex: RegExp): Result<RegExpExecArray> {
		const result = regex.exec(this.input.substr(this.pos));
		if (result == null) {
			return this.fail();
		}
		this.pos += result[0].length;
		return this.ok(result);
	}

	/**
	 * scan with parser
	*/
	public parser<T extends Parser<ParserResult<T>>>(parser: T): Result<ParserResult<T>> {
		const storedPos = this.pos;
		const match = parser(this);
		if (!match.ok) {
			this.pos = storedPos; // backtrack
		}
		return match;
	}

	/**
	 * scan by sequence with parsers
	*/
	// NOTE: Tの制約が思いつくまでは`Parser<any>[]`
	// NOTE: resultの型が思いつくまでは`any`
	public sequence<T extends Parser<any>[]>(parsers: [...T]): Result<ParserResults<T>> {
		const result: any = [];
		for (const p of parsers) {
			const match = this.parser(p);
			if (!match.ok) {
				return this.fail();
			}
			result.push(match.result);
		}
		return this.ok(result);
	}

	/**
	 * scan by ordered-choice
	*/
	public choice<T extends Parser<ParserResult<T>>>(parsers: T[]): Result<ParserResult<T>> {
		for (const p of parsers) {
			const result = this.parser(p);
			if (result.ok) {
				return result;
			}
		}
		return this.fail();
	}

	// match

	/**
	 * match with parser (no-consuming)
	*/
	public match<T extends Parser<ParserResult<T>>>(parser: T): boolean {
		const originPos = this.pos;
		const match = parser(this);
		this.pos = originPos;
		return match.ok;
	}

	/**
	 * match eof
	*/
	public eof(): boolean {
		return this.pos >= this.input.length;
	}

	// other

	public debugLog(log: string): void {
		if (this.debug) {
			console.log(log);
		}
	}
}

const failureObject: Failure = {
	ok: false,
};

export function cache<T extends Parser<ParserResult<T>>>(parser: T, cacheTable: Map<number, CacheItem<ParserResult<T>>> = new Map()): Parser<ParserResult<T>> {
	return (ctx) => {
		const cache = cacheTable.get(ctx.pos);
		if (cache != null) {
			// hit cache
			ctx.pos = cache.pos;
			return ctx.ok(cache.result);
		}

		const cachePos = ctx.pos;
		const match = ctx.parser(parser);

		if (match.ok) {
			// set cache
			cacheTable.set(cachePos, {
				pos: ctx.pos, // next pos
				result: match.result,
			});
		}
		return match;
	};
}
