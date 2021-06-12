<h1>目次</h2>

ブロック構文:
- [引用ブロック](#quote)
- [検索ブロック](#search)
- [コードブロック](#code-block)
- [数式ブロック](#math-block)
- [中央寄せブロック](#center)

インライン構文:
構文                           | 改行可能？
-------------------------------|-----------
[揺れる字](#big)               | はい
[太字](#bold)                  | はい
[目立たない字](#small)         | はい
[イタリック](#italic)          | はい
[打ち消し線](#strike)          | いいえ
[インラインコード](#inline-code) | いいえ
[インライン数式](#math-inline)  | いいえ
[メンション](#mention)         | いいえ
[ハッシュタグ](#hashtag)       | いいえ
[URL](#url)                    | いいえ
[リンク](#link)                | いいえ
[絵文字コード(カスタム絵文字)](#emoji-code) | いいえ
[MFM関数](#fn)                 | はい
[Unicode絵文字](#unicode-emoji) | いいえ
[テキスト](#text)              | はい



<h1 id="quote">引用ブロック</h1>

## 形式
```
> abc
>abc
>>nest
```

## ノード
```js
{
  type: 'quote',
  children: [
    { type: 'text', props: { text: 'abc' } }
  ]
}
```

## 詳細
- ブロック構文です。
- 引用された内容には再度FullParserを適用する。
- `>`の後に続く0～1文字のスペースを無視する。
- 隣接する引用の行は一つになる。
- 複数行の引用では空行も含めることができる。
- 引用の後ろにある空行は無視される。([#61](https://github.com/misskey-dev/mfm.js/issues/61))



<h1 id="search">検索ブロック</h2>

## 形式
```
MFM 書き方 Search
MFM 書き方 検索
MFM 書き方 [Search]
MFM 書き方 [検索]
```

## ノード
```js
{
  type: 'search',
  props: {
    query: 'MFM 書き方',
    content: 'MFM 書き方 Search'
  }
}
```

## 詳細
- ブロック構文。
- Searchの大文字小文字は区別されない。



<h1 id="code-block">コードブロック</h2>

## 形式
<pre>
```
a

b```
```c
````
```
</pre>

<pre>
```js
abc
````
</pre>

## ノード
```js
{
  type: 'blockCode',
  props: {
    code: 'abc',
    lang: 'js'
  }
}
```

## 詳細
- ブロック構文です。
- langは指定されない場合はnullになる。



<h1 id="math-block">数式ブロック</h2>

## 形式
```
\[a = 1\]
```

```
\[
a = 2
\]
```

## ノード
```js
{
  type: 'mathBlock',
  props: {
    formula: 'a = 1'
  }
}
```

## 詳細
- ブロック構文です。
- `\[`は行頭でなければならない。
- `\]`は行末でなければならない。
- 前後のスペースと改行はトリミングされる。



<h1 id="center">中央寄せブロック</h2>

## 形式
```
<center>abc</center>
```
```
<center>
abc
</center>
```

## ノード
```js
{
  type: 'center',
  children: [
    { type: 'text', props: { text: 'abc' } }
  ]
}
```

## 詳細
- ブロック構文。
- `<center>`は行頭でなければならない。
- `</center>`は行末でなければならない。
- 中身を空にすることはできない。
- 内容には再度InlineParserを適用する。



<h1 id="big">揺れる字</h2>

**廃止予定の構文。代替の構文が用意されています。**
## 形式
```
***big!***
```

## ノード
```js
{
  type: 'fn',
  props: {
    name: 'tada',
    args: { }
  },
  children: [
    { type: 'text', props: { text: 'big!' } }
  ]
}
```

## 詳細
- インライン構文
- 内容には再度InlineParserを適用する。
- 内容には改行も含めることが可能です。



<h1 id="bold">太字</h2>

## 形式
```
**bold**
```

```
__bold__
```

## ノード
```js
{
  type: 'bold',
  children: [
    { type: 'text', props: { text: 'bold' } }
  ]
}
```

## 詳細
- インライン構文。
- 内容には再度InlineParserを適用する。
- 内容には改行も含めることが可能です。



<h1 id="small">目立たない字</h2>

## 形式
```
<small>small</small>
```

## ノード
```js
{
  type: 'small',
  children: [
    { type: 'text', props: { text: 'small' } }
  ]
}
```

## 詳細
- インライン構文です。
- 内容には再度InlineParserを適用する。
- 内容には改行も含めることが可能です。



<h1 id="italic">イタリック</h2>

## 形式
構文1:
```
<i>italic</i>
```

構文2:
```
*italic*
```

構文3:
```
_italic_
```

## ノード
```js
{
  type: 'italic',
  children: [
    { type: 'text', props: { text: 'italic' } }
  ]
}
```

## 詳細
- インライン構文。
- 内容には再度InlineParserを適用する。

構文1のみ:  
- 内容には改行も含めることが可能です。

構文2,3のみ:  
※1つ目の`*`と`_`を開始記号と呼ぶ。  
- 内容には`[a-z0-9 \t]i`にマッチする文字が使用できる。
- 開始記号の前の文字が(無い、改行、半角スペース、[a-zA-Z0-9]に一致しない)のいずれかの時にイタリック文字として判定される。



<h1 id="strike">打ち消し線</h2>

## 形式
```
~~strike~~
```

## ノード
```js
{
  type: 'strike',
  children: [
    { type: 'text', props: { text: 'strike' } }
  ]
}
```

## 詳細
- インライン構文。
- 内容には再度InlineParserを適用する。
- 内容には改行を含めることができない。
- 内容には`~`を含めることができない。



<h1 id="inline-code">インラインコード</h2>

## 形式
```
`$abc <- 1`
```

## ノード
```js
{
  type: 'inlineCode',
  props: {
    code: '$abc <- 1'
  }
}
```

## 詳細
- インライン構文。
- 内容には改行を含めることができない。
- 内容には「´」を含めることができない。



<h1 id="math-inline">インライン数式</h2>

## 形式
```
\(y = 2x\)
```

## ノード
```js
{
  type: 'mathInline',
  props: {
    formula: 'y = 2x'
  }
}
```

## 詳細
- インライン構文。
- 内容には改行を含めることができない。



<h1 id="mention">メンション</h2>

## 形式
```
@user@misskey.io
```
```
@user
```

## ノード
```js
{
  type: 'mention',
  props: {
    username: 'user',
    host: 'misskey.io',
    acct: '@user@misskey.io'
  }
}
```

```js
{
  type: 'mention',
  props: {
    username: 'user',
    host: null,
    acct: '@user'
  }
}
```

## 詳細
- インライン構文。
- 最初の`@`の前の文字が(改行、スペース、無し、[a-zA-Z0-9]に一致しない)のいずれかの場合にメンションとして認識する。

### ユーザ名
- 1文字以上。
- `A`～`Z` `0`～`9` `_` `-`が含められる。
- 1文字目と最後の文字は`-`にできない。

### ホスト名
- 1文字以上。
- `A`～`Z` `0`～`9` `_` `-` `.`が含められる。
- 1文字目と最後の文字は`-` `.`にできない。



<h1 id="hashtag">ハッシュタグ</h2>

## 形式
```
#abc
```

## ノード
```js
{
  type: 'hashtag',
  props: {
    hashtag: 'abc'
  }
}
```

## 詳細
- インライン構文。
- 内容には半角スペース、全角スペース、改行、タブ文字を含めることができない。
- 内容には`.` `,` `!` `?` `'` `"` `#` `:` `/` `【` `】` を含めることができない。
- 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」`
- `#`の前の文字が(改行、スペース、無し、[a-zA-Z0-9]に一致しない)のいずれかの場合にハッシュタグとして認識する。
- 内容が数字のみの場合はハッシュタグとして認識しない。



<h1 id="url">URL</h2>

## 形式
構文1:
```
https://misskey.io/@ai
```

```
http://hoge.jp/abc
```

構文2:
```
<https://misskey.io/@ai>
```

```
<http://藍.jp/abc>
```

## ノード
```js
{
  type: 'url',
  props: {
    url: 'https://misskey.io/@ai'
  }
}
```

## 詳細
- インライン構文。

構文1のみ:  
- 内容には`[.,a-z0-9_/:%#@$&?!~=+-]i`にマッチする文字を使用できる。
- 内容には対になっている括弧を使用できる。対象: `(` `)` `[` `]`
- `.`や`,`は最後の文字にできない。

構文2のみ:  
- 内容には改行、スペース以外の文字を使用できる。



<h1 id="link">リンク</h2>

## 形式
silent=false
```
[Misskey.io](https://misskey.io/)
```

silent=true
```
?[Misskey.io](https://misskey.io/)
```

## ノード
```js
[
  {
    type: 'link',
    props: {
      silent: false,
      url: 'https://misskey.io/'
    },
    children: [
      {
        type: 'text',
        props: {
          text: 'Misskey.io'
        }
      }
    ]
  }
]
```

## 詳細
- インライン構文。
- 内容には再度InlineParserを適用する。
- 内容に含まれるURLはテキストとしてパースする。



<h1 id="emoji-code">絵文字コード(カスタム絵文字)</h2>

## 形式
```
:thinking_ai:
```

## ノード
```js
{
  type: 'emojiCode',
  props: {
    name: 'thinking_ai'
  }
}
```

## 詳細
- インライン構文。



<h1 id="fn">関数</h2>

## 形式
構文1:
```
$[shake 🍮]
```

```
$[spin.alternate 🍮]
```

```
$[shake.speed=1s 🍮]
```

```
$[flip.h,v MisskeyでFediverseの世界が広がります]
```

構文2:
**廃止予定の構文。代替の構文(構文1)が用意されています。**
```
[shake 🍮]
```

```
[spin.alternate 🍮]
```

```
[shake.speed=1s 🍮]
```

```
[flip.h,v MisskeyでFediverseの世界が広がります]
```

## ノード
```js
{
  type: 'fn',
  props: {
    name: 'shake',
    args: { }
  },
  children: [
    { type: 'unicodeEmoji', props: { emoji: '👍' } }
  ]
}
```

## 詳細
- インライン構文
- 内容には再度InlineParserを適用する。
- 内容には改行も含めることが可能です。
- 使用できる関数名やパラメータはホスト側で定義され、パーサはその登録状況を関知しません。



<h1 id="unicode-emoji">Unicode絵文字</h2>

## 形式
```
😇
```

## ノード
```js
{
  type: 'unicodeEmoji',
  props: {
    emoji: '😇'
  }
}
```



<h1 id="text">テキスト</h2>

## 形式
```
abc
```

## ノード
```js
{
  type: 'text',
  props: 
    text: 'abc'
  }
}
```
