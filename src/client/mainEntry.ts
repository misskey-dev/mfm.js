import { PegParser } from '../parser/pegParser';

async function entryPoint() {
	const coreParser: PegParser = require('../../built/parser/coreParser.js');

	const input = '[hoge]';
	console.log('parsing input:', input);
	const result = coreParser.parse(input);
	console.log('parsing result:');
	console.log(result);
}
entryPoint()
.catch(err => console.log(err));
