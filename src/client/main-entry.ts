import { parse } from '../../built/index';

async function entryPoint() {
	const result = parse('abc');
	console.log(JSON.stringify(result));
}
entryPoint()
.catch(err => {
	console.log(err);
});
