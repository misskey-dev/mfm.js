
type Success = {
	success: true;
	value: any;
	index: number;
};

type Failure = { success: false };

type Reply = Success | Failure;

export function success(index: number, value: any): Success {
	return {
		success: true,
		value: value,
		index: index,
	};
}

export function failure(): Failure {
	return { success: false };
}

type ParserHandler = (input: string, index: number, state: any) => Reply

export class Parser {
	public handler: ParserHandler;

	constructor(handler: ParserHandler) {
		this.handler = handler;
	}

	map(fn: (value: any) => any): Parser {
		return new Parser((input, index, state) => {
			const result = this.handler(input, index, state);
			if (!result.success) {
				return result;
			}
			return success(result.index, fn(result.value));
		});
	}

	atLeast(n: number) {
		return new Parser((input, index, state) => {
			let result;
			let accum = [];
			while (index < input.length) {
				result = this.handler(input, index, state);
				if (!result.success) {
					break;
				}
				index = result.index;
				accum.push(result.value);
			}
			if (accum.length < n) {
				return failure();
			}
			return success(index, accum);
		});
	}
}

export const any = new Parser((input, index, state) => {
	if ((input.length - index) < 1) {
		return failure();
	}
	const value = input.charAt(index);
	return success(index + 1, value);
});

export const str = (value: string): Parser => {
	return new Parser((input, index, state) => {
		if ((input.length - index) < value.length) {
			return failure();
		}
		if (input.substr(index, value.length) != value) {
			return failure();
		}
		return success(index + value.length, value);
	});
};

export const seq = (parsers: Parser[], select?: number): Parser => {
	return new Parser((input, index, state) => {
		let result;
		const accum = [];
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, index, state);
			if (!result.success) {
				return result;
			}
			index = result.index;
			accum.push(result.value);
		}
		return success(index, select != null ? accum[select] : accum);
	});
};

export const alt = (parsers: Parser[]): Parser => {
	return new Parser((input, index, state) => {
		let result;
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, index, state);
			if (result.success) {
				return result;
			}
		}
		return failure();
	});
};

export const match = (parser: Parser): Parser => {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return result.success
			? success(index, null)
			: failure();
	});
};

export const notMatch = (parser: Parser): Parser => {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return !result.success
			? success(index, null)
			: failure();
	});
};

export const lazy = (fn: () => Parser): Parser => {
	const parser: Parser = new Parser((input, index, state) => {
		console.log('eval');
		parser.handler = fn().handler;
		return parser.handler(input, index, state);
	});
	return parser;
};

export function createLanguage(syntaxes: Record<string, ((rules: Record<string, Parser>) => Parser)>) {
	const rules: Record<string, Parser> = {};
	for (const key of Object.keys(syntaxes)) {
		rules[key] = lazy(() => {
			return syntaxes[key](rules);
		});
	}
	return rules;
}
