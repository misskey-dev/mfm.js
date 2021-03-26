# mfm.js
## Description
A MFM parser implementation with PEG.js

## Installation
```
npm i rosee
```

## Usage
TypeScript:  
```ts
import * as mfm from 'rosee';

const inputText =
`<center>
Hello [tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>`;

// Generate a MFM tree from the MFM text.
const mfmTree = mfm.parse(inputText);

// Generate a MFM tree from the MFM plain text.
const plainMfmTree = mfm.parsePlain('I like the hot soup :soup:​');

// Reverse to a MFM text from the MFM tree.
const text = mfm.toString(mfmTree);

```

## Usage (Repository)
### 1. Clone
```
git clone https://github.com/misskey-dev/mfm.js.git
```

### 2. Install packages
```
cd mfm.js
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
