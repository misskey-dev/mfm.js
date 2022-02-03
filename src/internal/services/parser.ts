export type Parser<T> = (ctx: ParserContext) => Result<T>;

export type Result<T> = Success<T> | Failure;

export type Success<T> = {
	ok: true;
	resultData: T;
};

export type Failure = {
	ok: false;
};

export type ResultData<T> = T extends Result<infer R> ? R : never;

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

	public ok<T>(result: T): Success<T> {
		return {
			ok: true,
			resultData: result,
		};
	}

	public fail(): Failure {
		return {
			ok: false,
		};
	}

	public eof(): boolean {
		return this.pos >= this.input.length;
	}

	public anyChar(): Result<string> {
		if (this.pos < this.input.length) {
			return this.fail();
		}
		const c = this.input.charAt(this.pos);
		this.pos++;
		return this.ok(c);
	}

	public str(value: string): Result<string> {
		if (!this.input.startsWith(value, this.pos)) {
			return this.fail();
		}
		this.pos += value.length;
		return this.ok(value);
	}

	public char(charCode: number): Result<number> {
		if (this.input.charCodeAt(this.pos) !== charCode) {
			return this.fail();
		}
		this.pos++;
		return this.ok(charCode);
	}

	public regex(regex: RegExp): Result<RegExpExecArray> {
		const result = regex.exec(this.input.substr(this.pos));
		if (result == null) {
			return this.fail();
		}
		this.pos += result[0].length;
		return this.ok(result);
	}

	public consume<T extends Parser<ResultData<T>>>(matcher: T): Result<ResultData<T>> {
		const storedPos = this.pos;
		// if (matcher.isCacheable) {
		// 	// read cache
		// 	let cacheTable = this.cache.get(matcher.name);
		// 	if (cacheTable == null) {
		// 		cacheTable = new Map();
		// 		this.cache.set(matcher.name, cacheTable);
		// 	}
		// 	const cache: CacheItem<ResultData<T>> | undefined = cacheTable.get(this.pos);
		// 	if (cache != null) {
		// 		this.debugLog(`${this.pos}\t[hit cache] ${matcher.name}`);
		// 		this.pos = cache.pos;
		// 		return this.ok(cache.result);
		// 	}
		// 	// match
		// 	this.debugLog(`${this.pos}\tenter ${matcher.name}`);
		// 	this.stack.unshift(matcher);
		// 	const match = matcher(this);
		// 	this.stack.shift();
		// 	this.debugLog(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${matcher.name}`);
		// 	// write cache
		// 	if (match.ok) {
		// 		cacheTable.set(storedPos, { pos: this.pos, result: match.resultData });
		// 		this.debugLog(`${storedPos}\t[set cache] ${matcher.name}`);
		// 	}
		// 	return match;
		// }
		this.debugLog(`${this.pos}\tenter ${matcher.name}`);
		this.stack.unshift(matcher);
		const match = matcher(this);
		this.stack.shift();
		this.debugLog(`${storedPos}:${this.pos}\t${match.ok ? 'match' : 'fail'} ${matcher.name}`);
		return match;
	}

	public tryConsume<T extends Parser<ResultData<T>>>(matcher: T): Result<ResultData<T>> {
		const storedPos = this.pos;
		const match = this.consume(matcher);
		if (!match.ok) {
			this.pos = storedPos; // fallback
		}
		return match;
	}

	public tryConsumeAny<T extends Parser<ResultData<T>>>(matchers: T[]): Result<ResultData<T>> {
		for (const matcher of matchers) {
			const storedPos = this.pos;
			const match = this.consume(matcher);
			if (match.ok) {
				return match;
			}
			this.pos = storedPos; // fallback
		}

		return this.fail();
	}

	public match<T extends Parser<ResultData<T>>>(matcher: T): Result<ResultData<T>> {
		const storedPos = this.pos;
		const match = this.consume(matcher);
		this.pos = storedPos;

		return match;
	}

	public matchCharCode(charCode: number): boolean {
		return this.input.charCodeAt(this.pos) === charCode;
	}

	public matchStr(value: string): boolean {
		return this.input.startsWith(value, this.pos);
	}

	public matchRegex(regex: RegExp): RegExpExecArray | null {
		return regex.exec(this.input.substr(this.pos));
	}

	private debugLog(log: string): void {
		if (this.debug) {
			console.log(log);
		}
	}
}
