parsec.js
============

[![Build Status](https://api.travis-ci.org/yetone/parsec.js.svg?branch=master)](https://travis-ci.org/yetone/parsec.js)

A JavaScript parser combinator library inspired by Parsec of Haskell.

## Install:

```shell
npm install parsec.js
```

## Examples:

```javascript
import { regex, string, generate, or, plus, rshift, lshift } from 'parsec.js'

defineBinaryOperator('|', or)
defineBinaryOperator('+', plus)
defineBinaryOperator('>>', rshift)
defineBinaryOperator('<<', lshift)

const whitespace = regex('\\s*')
const lexeme = p => p << whitespace
const lbrace = lexeme(string('{'))
const rbrace = lexeme(string('}'))
const lbrack = lexeme(string('('))
const rbrack = lexeme(string(')'))
const negtive = lexeme(string('-'))

const reVarName = '[a-zA-Z_][a-zA-Z0-9_]*'

const id = lexeme(regex('\\$' + reVarName))
const attr = lexeme(regex(reVarName))
const value = id | lexeme(regex(reVarName))

const has = generate(function* has() {
  yield lbrack
  const _id = yield id
  const _attr = yield attr
  const _value = yield value
  yield rbrack
  return [_id, _attr, _value]
})

const oops = whitespace >> has

const s = oops.parse('($x y $z)')
console.log(s) // [ '$x', 'y', '$z' ]
```

More advanced sample: [JSON parser](https://github.com/yetone/parsec.js/blob/master/examples/json.js)

You can run: `NODE_PATH=./lib babel-node examples/json.js` to test this example.
