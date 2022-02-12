import { CharCode } from './character';

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

export type CacheSource = Map<Parser<any>, Map<number, CacheItem<any>>>;

export type CacheItem<T> = {
	ok: true,
	pos: number;
	result: T;
} | {
	ok: false,
};

export type Location = {
	row: number;
	column: number;
};

export type ParserOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

const failureObject: Failure = {
	ok: false,
};

export class ParserContext {
	public input: string;
	public pos = 0;
	public stack: Parser<any>[] = [];
	public debug = false;
	// cache
	public cacheSources: [CacheSource, CacheSource] = [
		new Map(), // for general
		new Map(), // for link label
	];
	// nesting control
	public nestLimit: number;
	public depth = 0;
	// fn
	public fnNameList: string[] | undefined;
	// link
	public inLink: boolean = false;

	public locationCache: Map<number, Location> = new Map();

	constructor(input: string, opts: ParserOpts) {
		this.input = input;
		this.nestLimit = (opts.nestLimit != null ? opts.nestLimit : 20);
		this.fnNameList = opts.fnNameList;
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

	// scan

	/**
	 * scan an any char
	*/
	public anyChar(): Result<string> {
		if (this.pos >= this.input.length) {
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
	 * match a string
	*/
	public matchStr(value: string, offset: number = 0): boolean {
		if (this.pos + offset < 0 || this.pos + offset >= this.input.length) {
			return false;
		}
		return this.input.startsWith(value, this.pos + offset);
	}

	/**
	 * match a char
	*/
	public matchChar(charCode: number, offset: number = 0): boolean {
		if (this.pos + offset < 0 || this.pos + offset >= this.input.length) {
			return false;
		}
		return (this.input.charCodeAt(this.pos + offset) === charCode);
	}

	/**
	 * match with regex
	*/
	public matchRegex(regex: RegExp, offset: number = 0): boolean {
		if (this.pos + offset < 0 || this.pos + offset >= this.input.length) {
			return false;
		}
		const result = regex.exec(this.input.substr(this.pos + offset));
		return result != null;
	}

	/**
	 * match with parser
	*/
	public match<T extends Parser<ParserResult<T>>>(parser: T, offset: number = 0): boolean {
		if (this.pos + offset < 0 || this.pos + offset >= this.input.length) {
			return false;
		}
		const originPos = this.pos;
		this.pos += offset;
		const match = parser(this);
		this.pos = originPos;
		return match.ok;
	}

	/**
	 * match by sequence with parsers
	*/
	public matchSequence<T extends Parser<ParserResult<T>>>(parsers: T[]): boolean {
		const originPos = this.pos;
		for (const p of parsers) {
			const match = this.parser(p);
			if (!match.ok) {
				this.pos = originPos;
				return false;
			}
		}
		this.pos = originPos;
		return true;
	}

	/**
	 * match eof
	*/
	public eof(): boolean {
		return this.pos >= this.input.length;
	}

	// other

	public location(pos: number): Location {
		let loc = this.locationCache.get(pos);
		if (loc != null) {
			return loc;
		}
		let row = 0;
		let column = 0;
		let i = 0;
		while (i < pos) {
			if (this.input.charCodeAt(i) === CharCode.lf) {
				row++;
				column = 0;
			} else {
				column++;
			}
			i++;
		}
		loc = {
			row: row,
			column: column,
		};
		this.locationCache.set(pos, loc);
		return loc;
	}

	public debugLog(log: string): void {
		if (this.debug) {
			console.log(log);
		}
	}
}
