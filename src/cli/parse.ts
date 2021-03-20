import inputLine, { InputCanceledError } from './misc/inputLine';
import { parse } from '..';

async function entryPoint() {
	console.log('intaractive parser');

	while (true) {
		let input: string;
		try {
			input = await inputLine('> ');
		}
		catch (err) {
			if (err instanceof InputCanceledError) {
				console.log('bye.');
				return;
			}
			throw err;
		}

		// replace special chars
		input = input
			.replace(/\\n/g, '\n')
			.replace(/\\t/g, '\t')
			.replace(/\\u00a0/g, '\u00a0');

		let result: any;
		try {
			result = parse(input);
			console.log(JSON.stringify(result));
		}
		catch (err) {
			console.log('parsing error:');
			console.log(err);
		}
		console.log();
	}
}
entryPoint()
.catch(err => {
	console.log(err);
	process.exit(1);
});
