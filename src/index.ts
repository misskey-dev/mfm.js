import { PegParser } from './parser/pegParser';

const coreParser: PegParser = require('./parser/coreParser');
const input = '[hoge]';
console.log('parsing input:', input);
const result = coreParser.parse(input);
console.log('parsing result:');
console.log(result);
