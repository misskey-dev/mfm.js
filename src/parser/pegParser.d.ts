export interface PegParserOptions {
	startRule?: string;
}
export interface PegParser {
	parse(input: string, options?: PegParserOptions): any;
}
