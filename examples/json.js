import { regex, string, generate, or, plus, rshift, lshift } from '../lib'

defineBinaryOperator('|', or)
defineBinaryOperator('+', plus)
defineBinaryOperator('>>', rshift)
defineBinaryOperator('<<', lshift)

const whitespace = regex('\\s*')

const lexeme = p => p << whitespace

const lbrace = lexeme(string('{'))
const rbrace = lexeme(string('}'))
const lbrack = lexeme(string('['))
const rbrack = lexeme(string(']'))
const colon = lexeme(string(':'))
const comma = lexeme(string(','))
const _true = lexeme(string('true')).result(true)
const _false = lexeme(string('false')).result(false)
const _null = lexeme(string('null')).result(null)

const number = lexeme(
  regex('^\\-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?')
).map(parseFloat)

const stringPart = regex('^[^"\\\\]+')
const stringEsc = string('\\\\') >> (
  string('\\\\')
    | string('/')
    | string('b').result('\\b')
    | string('f').result('\\f')
    | string('n').result('\\n')
    | string('r').result('\\r')
    | string('t').result('\\t')
    | regex('u[0-9a-fA-F]{4}').map(s => String.fromCharCode(parseInt(s.slice(1), 16)))
)

const quoted = lexeme(generate(function* quoted() {
  yield string('"')
  const body = yield (stringPart | stringEsc).many()
  yield string('"')
  return body.join('')
}))

const array = generate(function* array() {
  yield lbrack
  const first = yield value
  const rest = yield (comma >> value).many()
  yield rbrack
  rest.unshift(first)
  return rest
})

const objectPair = generate(function* objectPair() {
  const key = yield quoted
  yield colon
  const val = yield value
  return [key, val]
})

const jsonObject = generate(function* jsonObject() {
  yield lbrace
  const first = yield objectPair
  const rest = yield (comma >> value).many()
  yield rbrace
  rest.unshift(first)
  return rest.reduce((a, c) => {
    a[c[0]] = c[1]
    return a
  }, {})
})

const value = quoted | number | jsonObject | array | _true | _false | _null

const json = whitespace >> value

// eslint-disable-next-line no-console
console.log(json.parse('{"1": [2]}'))
