import { bigMatcher } from './syntax/big';
import { boldAstaMatcher, boldTagMatcher, boldUnderMatcher } from './syntax/bold';
import { emojiCodeMatcher } from './syntax/emojiCode';
import { fnMatcher } from './syntax/fn';
import { italicAstaMatcher, italicTagMatcher, italicUnderMatcher } from './syntax/italic';
import { mentionMatcher } from './syntax/mention';
import { smallTagMatcher } from './syntax/small';
import { strikeTagMatcher } from './syntax/strike';

// NOTE: 構文要素のマッチ試行の処理は、どの構文にもマッチしなかった場合に長さ1のstring型のノードを生成します。
// MFM文字列を処理するために構文のマッチ試行が繰り返し実行された際は、連続するstring型ノードを1つのtextノードとして連結する必要があります。

export type Matcher<T> = (ctx: MatcherContext) => Match<T>;

export type Match<T> = MatchSuccess<T> | MatchFailure;

export type MatchSuccess<T> = {
	ok: true;
	result: T;
};

export type MatchFailure = {
	ok: false;
};

type MatchResult<T> = T extends (ctx: MatcherContext) => Match<infer R> ? R : any;

export type ConsumeOpts = Partial<{

}>;

export type MatcherContextOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

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

	constructor(input: string, opts: MatcherContextOpts) {
		this.input = input;
		this.fnNameList = opts.fnNameList;
		this.nestLimit = opts.nestLimit || 20;
		this.plainMatcher = createSyntaxMatcher(SyntaxLevel.plain);
		this.inlineMatcher = createSyntaxMatcher(SyntaxLevel.inline);
		this.fullMatcher = createSyntaxMatcher(SyntaxLevel.full);
	}

	public ok<T>(result: T): MatchSuccess<T> {
		return {
			ok: true,
			result: result,
		};
	}

	public fail(): MatchFailure {
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

	public consume<T extends (ctx: MatcherContext) => Match<MatchResult<T>>>(matcher: T, opts?: ConsumeOpts) {
		opts = opts || {};
		const matched = matcher(this);
		return matched;
	}

	public tryConsume<T extends (ctx: MatcherContext) => Match<MatchResult<T>>>(matcher: T, opts?: ConsumeOpts) {
		opts = opts || {};
		const fallback = this.pos;
		const matched = matcher(this);
		if (!matched.ok) {
			this.pos = fallback;
		}
		return matched;
	}

	public match<T extends (ctx: MatcherContext) => Match<MatchResult<T>>>(matcher: T) {
		const pos = this.pos;
		const matched = matcher(this);
		this.pos = pos;
		return matched.ok;
	}
}

export function LfMatcher(ctx: MatcherContext) {
	let matched;

	matched = /^\r\n|[\r\n]/.exec(ctx.getText());
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(matched[0]);
}

export enum SyntaxLevel {
	plain = 0,
	inline,
	full,
}

export function createSyntaxMatcher(syntaxLevel: SyntaxLevel) {
	return function (ctx: MatcherContext) {
		let matched;

		if (ctx.eof()) {
			return ctx.fail();
		}

		if (ctx.depth < ctx.nestLimit) {
			ctx.depth++;

			switch (ctx.input[ctx.pos]) {

				case '*': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// ***big***
					matched = ctx.tryConsume(bigMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					// **bold**
					matched = ctx.tryConsume(boldAstaMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					// *italic*
					matched = ctx.tryConsume(italicAstaMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
					break;
				}

				case '$': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// $[fn ]
					matched = ctx.tryConsume(fnMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
					break;
				}

				case '?': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// ?[silent link]()
					break;
				}

				case '<': {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// <s>
						matched = ctx.tryConsume(strikeTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						// <i>
						matched = ctx.tryConsume(italicTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						// <b>
						matched = ctx.tryConsume(boldTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						// <small>
						matched = ctx.tryConsume(smallTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						if (syntaxLevel >= SyntaxLevel.full) {
							// <center>
						}

						// <https://example.com>

					}
					break;
				}

				case '>': {
					if (syntaxLevel < SyntaxLevel.full) break;

					// > quote
					break;
				}

				case '[': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// [link]()
					break;
				}

				case '`': {
					// ```code block```
					// `inline code`
					break;
				}

				case '\\': {
					// \(math inline\)
					// \[math block\]
					break;
				}

				case '~': {
					if (syntaxLevel < SyntaxLevel.inline) break;
					// ~~strike~~
					break;
				}

				case ':': {
					if (syntaxLevel < SyntaxLevel.plain) break;

					// :emojiCode:
					matched = ctx.consume(emojiCodeMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					break;
				}

				case '_': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// __bold__
					matched = ctx.tryConsume(boldUnderMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					// _italic_
					matched = ctx.tryConsume(italicUnderMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					break;
				}

				case '@': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// @mention
					matched = ctx.tryConsume(mentionMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					break;
				}

				case '#': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// #hashtag
					break;
				}

				case 'h': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// https://example.com
					break;
				}
			}

			// search
			// unicode emoji

			ctx.depth--;
		}

		// text node
		const text = ctx.input[ctx.pos];
		ctx.pos++;

		return ctx.ok(text);
	};
}
