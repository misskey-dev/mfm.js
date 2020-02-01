import { PegParser } from './parser/peg-parser';

const coreParser: PegParser = require('./parser/core-parser');
const input = '[hoge]';
console.log('parsing input:', input);
const result = coreParser.parse(input);
console.log('parsing result:');
console.log(JSON.stringify(result));
