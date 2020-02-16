import { promises as fs } from 'fs';
import peg from 'pegjs';

export async function generateParser(srcPath: string, trace?: boolean): Promise<peg.Parser>
{
	// read the parser source
	const source = await fs.readFile(srcPath, 'utf8');

	// generate a parser code
	const generatedCode = peg.generate(source, {
		allowedStartRules: ['root', 'all', 'inline'],
		trace: trace
	});

	return generatedCode;
}

export async function generateCode(srcPath: string, trace?: boolean): Promise<string>
{
	// read the parser source
	const source = await fs.readFile(srcPath, 'utf8');

	// generate a parser code
	const generatedCode = peg.generate(source, {
		allowedStartRules: ['root', 'all', 'inline'],
		output: 'source',
		format: 'commonjs',
		trace: trace
	});

	return generatedCode;
}
