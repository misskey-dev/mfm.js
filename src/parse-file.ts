import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from './parser/index';


async function entryPoint() {
	const input = await fs.readFile(path.join(__dirname, '../input.txt'), { encoding: 'utf-8' });
	try {
		console.log(JSON.stringify(parse(input)));
	}
	catch (err) {
		console.log(err);
	}
}
entryPoint()
.catch(err => {
	console.log(err);
	process.exit(1);
});
