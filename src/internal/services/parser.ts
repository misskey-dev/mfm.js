import { ParserOpts } from '../mfm';

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

export class ParserContext {
	public input: string;
	public pos = 0;
	public nestLimit: number;
	public depth = 0;
	public debug = false;
	public cache: Map<string, Map<number, CacheItem<any>>> = new Map();
	public stack: Parser<any>[] = [];
	// fn
	public fnNameList: string[] | undefined;

	constructor(input: string, opts: ParserOpts) {
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
