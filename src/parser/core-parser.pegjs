{
	function buildList(head, others) {
		return [ head, ...others ];
	}

	function createTree(type, props, children) {
		props = props || { };
		children = children || [ ];
		children = !Array.isArray(children) ? [children] : children;

		return {
			node: { type, props },
			children: children
		};
	}
}

root
	= block
	/ inline

// plain
// 	=

block
	= title
	/ quote
	/ search
	/ blockCode

inline
	= big


// block: title

title
	= titleA / titleB

titleA
	= "【" content:titleA_content "】"
{
	return createTree('title', { }, content);
}

titleA_content
	= (inline / titleA_text)+

titleA_text
	= s:$(titleA_char+)
{
	return createTree('text', { text: s });
}

titleA_char
	= !(inline / "】") c:CHAR { return c; }

titleB
	= "[" content: titleB_content "]"
{
	return createTree('title', { }, content);
}

titleB_content
	= (inline / titleB_text)+

titleB_text
	= s:$(titleB_char+)
{
	return createTree('text', { text: s });
}

titleB_char
	= !(inline / "]") c:CHAR { return c; }


// block: quote
// (handle the line as quote block if got a char ">" of the line head.)

quote
	= head:quote_line tail:(NEWLINE tree:quote_line { return tree; })*
{
	const trees = [head, ...tail];
	console.log(trees.map(tree => tree.children));//.flat();
	return [head, ...tail].join('\n');
}

quote_line
	= ">" content:quote_content &ENDLINE { return createTree('quote', { }, content); }

// TODO: allow nesting
quote_content
	= quote_text

quote_text
	= s:$(CHAR+) { return createTree('text', { text: s }); }


// block: search

search
	= q:search_query sp:[ 　\t] key:search_keyToken &ENDLINE
{
	return createTree('search', {
		query: q,
		content: [ q, sp, key ].join('')
	});
}

search_query =
	head:CHAR tail:(!([ 　\t] search_keyToken ENDLINE) c:CHAR { return c; })*
{
	return head + tail.join('');
}

search_keyToken
	= "検索" / "search"i


// block: blockCode

blockCode
	= "```" NEWLINE lines: (!("```" ENDLINE) line:blockCode_line NEWLINE { return line; } )* "```" &ENDLINE { return lines; }

// TODO: allow nesting
blockCode_line
	= t:$(CHAR*) { return t; }


// inline: big

big
	= "***" content:big_content "***"
{
	return createTree('big', { }, content);
}

big_content
	= (big_text / inline)*

big_text
	= s:$(big_char+) { return createTree('text', { text: s }); }

big_char
	= !("***") c:CHAR { return c; }


// Core rules

CHAR
	= !NEWLINE c:. { return c; }

ENDLINE
	= NEWLINE / EOF

NEWLINE
	= "\r\n" / [\r\n]

EOF
	= !.

// __ "whitespaces"
// 	= _+

// _ "whitespace"
// 	= [ \t]
