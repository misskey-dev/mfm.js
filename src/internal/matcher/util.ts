import { createSyntaxMatcher } from '.';
import { MfmInline, MfmNode, MfmPlainNode, TEXT } from '../../node';

export enum SyntaxLevel {
	plain = 0,
	inline,
	full,
}

export class MatcherContext {
	public input: string;
	public pos: number = 0;
	public cache: Record<string, any> = {};
	public fnNameList: string[] | undefined;
	public nestLimit: number;
	public depth: number = 0;
	public plainMatcher: ReturnType<typeof createSyntaxMatcher>;
	public inlineMatcher: ReturnType<typeof createSyntaxMatcher>;
	public fullMatcher: ReturnType<typeof createSyntaxMatcher>;

	constructor(input: string, opts: Partial<{ fnNameList: string[]; nestLimit: number; }>) {
		this.input = input;
		this.fnNameList = opts.fnNameList;
		this.nestLimit = opts.nestLimit || 20;
		this.plainMatcher = createSyntaxMatcher(SyntaxLevel.plain);
		this.inlineMatcher = createSyntaxMatcher(SyntaxLevel.inline);
		this.fullMatcher = createSyntaxMatcher(SyntaxLevel.full);
	}

	public ok<T>(resultData: T): MatcherSuccess<T> {
		return {
			ok: true,
			resultData: resultData,
		};
	}

	public fail(): MatcherFailure {
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

export type MatcherSuccess<T> = {
	ok: true;
	resultData: T;
};

export type MatcherFailure = {
	ok: false;
};

export type MatcherResult<T> = MatcherSuccess<T> | MatcherFailure;

export type Matcher<T> = (ctx: MatcherContext) => MatcherResult<T>;

/**
 * push a node to a node array.
 * in this operation, string node is managed.
*/
export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void
export function pushNode(node: MfmInline | string, nodes: MfmInline[]): void
export function pushNode(node: MfmPlainNode | string, nodes: MfmPlainNode[]): void
export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void {
	if (typeof node == 'string') {
		// store text node
		let foundText = false;
		if (nodes.length > 0) {
			const lastNode = nodes[nodes.length - 1];
			if (lastNode.type == 'text') {
				lastNode.props.text += node;
				foundText = true;
			}
		}
		if (!foundText) {
			nodes.push(TEXT(node));
		}
	} else {
		nodes.push(node);
	}
}
