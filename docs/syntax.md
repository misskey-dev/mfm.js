<h1>目次</h2>

ブロック構文:
- [引用ブロック](#quote)
- [検索ブロック](#search)
- [コードブロック](#code-block)
- [数式ブロック](#math-block)
- [中央寄せブロック](#center)

インライン構文:
- [揺れる字](#big)
- [太字](#bold)
- [目立たない字](#small)
- [イタリック](#italic)
- [打ち消し線](#strike)
- [インラインコード](#inline-code)
- [インライン数式](#math-inline)
- [メンション](#mention)
- [ハッシュタグ](#hashtag)
- [URL](#url)
- [リンク](#link)
- [絵文字コード(カスタム絵文字)](#emoji-code)
- [MFM関数](#fn)
- [Unicode絵文字](#unicode-emoji)
- [テキスト](#text)



<h1 id="quote">Block: 引用ブロック</h1>

## 形式
```
> abc
>abc
>>nest
```

## 詳細
- 引用された内容には再度FullParserを適用する。
- `>`の後に続く0～1文字のスペースを無視する。
- 隣接する引用の行は一つになる。
- 複数行の引用では空行も含めることができる。
- 引用の後ろにある空行は無視される。([#61](https://github.com/misskey-dev/mfm.js/issues/61))

## ノード
```js
{
  type: 'quote',
  children: [
    { type: 'text', props: { text: 'abc' } }
  ]
}
```



<h1 id="search">Block: 検索ブロック</h2>

## 形式
```
MFM 書き方 Search
MFM 書き方 検索
MFM 書き方 [Search]
MFM 書き方 [検索]
```

## 詳細
- Searchの大文字小文字は区別されない。

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



<h1 id="code-block">Block: コードブロック</h2>

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

## 詳細
- langは指定されない場合はnullになる。

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



<h1 id="math-block">Block: 数式ブロック</h2>

## 形式
```
\[a = 1\]
```

```
\[
a = 2
\]
```

## 詳細
- `\[`は行頭でなければならない。
- `\]`は行末でなければならない。
- 前後のスペースと改行はトリミングされる。

## ノード
```js
{
  type: 'mathBlock',
  props: {
    formula: 'a = 1'
  }
}
```



<h1 id="center">Block: 中央寄せブロック</h2>

## 形式
```
<center>abc</center>
```
```
<center>
abc
</center>
```

## 詳細
- `<center>`は行頭でなければならない。
- `</center>`は行末でなければならない。
- 内容には再度InlineParserを適用する。

## ノード
```js
{
  type: 'center',
  children: [
    { type: 'text', props: { text: 'abc' } }
  ]
}
```



<h1 id="big">Inline: 揺れる字</h2>

**廃止予定の構文。代替の構文が用意されています。**
## 形式
```
***big!***
```

## 詳細
- 内容には再度InlineParserを適用する。
- 内容にはすべての文字、改行が使用できる。
- 内容を空にすることはできない。

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



<h1 id="bold">Inline: 太字</h2>

## 形式
構文1:
```
**bold**
```

構文2:
```
__bold__
```

構文3:
```
<b>bold</b>
```

## 詳細
- 内容には再度InlineParserを適用する。
- 内容を空にすることはできない。

構文1,3のみ:  
- 内容にはすべての文字、改行が使用できる。

構文2のみ:  
- 内容には`[a-z0-9 \t]i`にマッチする文字が使用できる。

## ノード
```js
{
  type: 'bold',
  children: [
    { type: 'text', props: { text: 'bold' } }
  ]
}
```



<h1 id="small">Inline: 目立たない字</h2>

## 形式
```
<small>small</small>
```

## 詳細
- 内容には再度InlineParserを適用する。
- 内容を空にすることはできない。
- 内容にはすべての文字、改行が使用できる。

## ノード
```js
{
  type: 'small',
  children: [
    { type: 'text', props: { text: 'small' } }
  ]
}
```



<h1 id="italic">Inline: イタリック</h2>

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

## 詳細
- 内容には再度InlineParserを適用する。
- 内容を空にすることはできない。

構文1のみ:  
- 内容にはすべての文字、改行が使用できる。

構文2,3のみ:  
※1つ目の`*`と`_`を開始記号と呼ぶ。  
- 内容には`[a-z0-9 \t]i`にマッチする文字が使用できる。
- 開始記号の前の文字が`[a-z0-9]i`に一致しない時にイタリック文字として判定される。

## ノード
```js
{
  type: 'italic',
  children: [
    { type: 'text', props: { text: 'italic' } }
  ]
}
```



<h1 id="strike">Inline: 打ち消し線</h2>

## 形式
構文1:
```
~~strike~~
```

構文2:
```
<s>strike</s>
```

## 詳細
- 内容には再度InlineParserを適用する。
- 内容を空にすることはできない。

構文1のみ:  
- 内容には`~`、改行以外の文字を使用できる。

構文2のみ:  
- 内容にはすべての文字、改行が使用できる。

## ノード
```js
{
  type: 'strike',
  children: [
    { type: 'text', props: { text: 'strike' } }
  ]
}
```



<h1 id="inline-code">Inline: インラインコード</h2>

## 形式
```
`$abc <- 1`
```

## 詳細
- 内容を空にすることはできない。
- 内容には改行を含めることができない。
- 内容には「´」を含めることができない。

## ノード
```js
{
  type: 'inlineCode',
  props: {
    code: '$abc <- 1'
  }
}
```



<h1 id="math-inline">Inline: インライン数式</h2>

## 形式
```
\(y = 2x\)
```

## 詳細
- 内容を空にすることはできない。
- 内容には改行を含めることができない。

## ノード
```js
{
  type: 'mathInline',
  props: {
    formula: 'y = 2x'
  }
}
```



<h1 id="mention">Inline: メンション</h2>

## 形式
```
@user@misskey.io
```
```
@user
```

## 詳細
- 最初の`@`の前の文字が`[a-z0-9]i`に一致しない場合にメンションとして認識する。

### ユーザ名
- 1文字以上。
- `A`～`Z` `0`～`9` `_` `-` `.`が含められる。
- 1文字目と最後の文字は`-` `.`にできない。

### ホスト名
- 1文字以上。
- `A`～`Z` `0`～`9` `_` `-` `.`が含められる。
- 1文字目と最後の文字は`-` `.`にできない。

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



<h1 id="hashtag">Inline: ハッシュタグ</h2>

## 形式
```
#abc
```

## 詳細
- 内容を空にすることはできない。
- 内容には半角スペース、全角スペース、改行、タブ文字を含めることができない。
- 内容には`.` `,` `!` `?` `'` `"` `#` `:` `/` `【` `】` `<` `>` `【` `】` `(` `)` `「` `」` `（` `）` を含めることができない。
- 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」` `（）`
- `#`の前の文字が`[a-z0-9]i`に一致しない場合にハッシュタグとして認識する。
- 内容が数字のみの場合はハッシュタグとして認識しない。

## ノード
```js
{
  type: 'hashtag',
  props: {
    hashtag: 'abc'
  }
}
```



<h1 id="url">Inline: URL</h2>

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

## 詳細
構文1のみ:  
- 内容には`[.,a-z0-9_/:%#@$&?!~=+-]i`にマッチする文字を使用できる。
- 内容には対になっている括弧を使用できる。対象: `( )` `[ ]`
- `.`や`,`は最後の文字にできない。

構文2のみ:  
- 内容には改行、スペース以外の文字を使用できる。

## ノード
構文1:
```js
{
  type: 'url',
  props: {
    url: 'https://misskey.io/@ai'
  }
}
```

または

```js
{
  type: 'url',
  props: {
    url: 'https://misskey.io/@ai',
    brackets: false
  }
}
```

構文2:
```js
{
  type: 'url',
  props: {
    url: 'https://misskey.io/@ai',
    brackets: true
  }
}
```



<h1 id="link">Inline: リンク</h2>

## 形式
silent=false
```
[Misskey.io](https://misskey.io/)
```

silent=true
```
?[Misskey.io](https://misskey.io/)
```

## 詳細
- 表示テキストには再度InlineParserを適用する。ただし、表示テキストではURL、リンク、メンションは使用できない。

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



<h1 id="emoji-code">Inline: 絵文字コード(カスタム絵文字)</h2>

## 形式
```
:thinking_ai:
```

## 詳細
- 内容を空にすることはできない。
- 内容には[a-z0-9_+-]iにマッチする文字を使用できる。

## ノード
```js
{
  type: 'emojiCode',
  props: {
    name: 'thinking_ai'
  }
}
```



<h1 id="fn">Inline: 関数</h2>

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

## 詳細
- 内容には再度InlineParserを適用する。
- 内容を空にすることはできない。
- 内容には改行も含めることが可能です。

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



<h1 id="unicode-emoji">Inline: Unicode絵文字</h2>

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



<h1 id="text">Inline: テキスト</h2>

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
