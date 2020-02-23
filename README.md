# mfm-parser-pegjs
## Description
A MFM parser made with PEG.js (In developing)  

## Installation
```
npm i mfm-parser-pegjs
```

## Usage
```ts
import { parse } from 'mfm-parser-pegjs';

// parse a MFM code
const result = parse('this is a ***MFM text***');
```

## Usage (Repository)
### 1. Clone
```
git clone https://github.com/marihachi/mfm-parser-pegjs.git
```

### 2. Build
For production:  
```
npm run build
```

For development:  
```
npm run build-dev
```

### Use Interactive interface
```
npm run parse
```

## License
This software is released under the [MIT License](LICENSE).

This software includes codes of other softwares:
- PEG.js: https://raw.githubusercontent.com/pegjs/pegjs/master/LICENSE
