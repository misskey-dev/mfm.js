import { PegParser } from '../parser/peg-parser';

async function entryPoint() {
	const coreParser: PegParser = require('../../built/parser/core-parser.js');

	const input = '[hoge]';
	console.log('parsing input:', input);
	const result = coreParser.parse(input);
	console.log('parsing result:');
	console.log(JSON.stringify(result));
}
entryPoint()
.catch(err => console.log(err));
