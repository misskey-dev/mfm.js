import { promises as fs } from 'fs';
import path from 'path';
import { generateCode } from './misc/generate-peg';

async function entryPoint() {
	// get arguments
	let trace = false;
	if (process.argv.some(i => i == 'trace')) {
		trace = true;
	}

	const srcPath = path.join(__dirname, '../src/parser/core-parser.pegjs');
	const destPath = path.join(__dirname, '../built/parser/core-parser.js');

	// generate a code from PEG
	const generatedCode = await generateCode(srcPath, trace);

	// write the generated code
	await fs.writeFile(destPath, generatedCode, { encoding: 'utf8' });
}
entryPoint()
.catch(err => {
	console.log(err);
	process.exit(1);
});
