# mfm-parser-pegjs
## Description
A MFM parser made with PEG.js (In developing)  

## Installation
```
npm i mfm-parser-pegjs
```

## Usage
```ts
import * as mfm from 'mfm-parser-pegjs';

// parse a MFM text
const result = mfm.parse('good morning ***everyone!***');

// parse a MFM plain text
const plainResult = mfm.parsePlain('I like the hot soup :soup:​');
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
This software is released under the [MIT License](LICENSE) unless otherwise noted.  

This software includes code of therd party softwares below:  
- twemoji-parser  
  Copyright (c) 2018 Twitter, Inc.  
  MIT Licence: https://github.com/twitter/twemoji-parser/blob/master/LICENSE.md  
