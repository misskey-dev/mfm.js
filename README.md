# mfm-parser-pegjs
## Description
A MFM parser implementation with PEG.js (In developing)  

## Installation
```
npm i mfm-parser-pegjs
```

## Usage
TypeScript:  
```ts
import * as mfm from 'mfm-parser-pegjs';

// parse a MFM text
const result = mfm.parse('good morning ***everynyan!***');

// parse a MFM plain text
const plainResult = mfm.parsePlain('I like the hot soup :soup:​');
```

## Usage (Repository)
### 1. Clone
```
git clone https://github.com/marihachi/mfm-parser-pegjs.git
```

### 2. Install packages
```
cd mfm-parser-pegjs
npm i
```

### 3. Build
```
npm run build
```

### Use the interactive CLI parser
```
npm run parse
```

## License
This software is released under the [MIT License](LICENSE).  
