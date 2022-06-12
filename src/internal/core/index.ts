
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
}

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
