import test from 'ava'
import { regex, string, generate, or, plus, rshift, lshift } from '../lib'

defineBinaryOperator('|', or)
defineBinaryOperator('+', plus)
defineBinaryOperator('>>', rshift)
defineBinaryOperator('<<', lshift)

test('string', t => {
  const parser = string('x')
  t.is(parser.parse('x'), 'x')

  const e = t.throws(() => {
    parser.parse('y')
  })
  t.true(e instanceof Error)
})

test('regex', t => {
  const parser = regex('[0-9]')
  t.is(parser.parse('1'), '1')
  t.is(parser.parse('3'), '3')

  t.throws(() => {
    parser.parse('x')
  })
})

test('then', t => {
  const parser = string('x') >> string('y')

  t.is(parser.parse('xy'), 'y')

  t.throws(() => {parser.parse('y')})
  t.throws(() => {parser.parse('z')})
})

test('bind', t => {
  let piped
  const parser = string('x').bind(x => {
    piped = x
    return string('y')
  })

  t.is(parser.parse('xy'), 'y')
  t.is(piped, 'x')

  t.throws(() => {parser.parse('x')})
})

test('generate', t => {
  let x, y

  const xy = generate(function* () {
    x = yield string('x')
    y = yield string('y')
    return 3
  })

  t.is(xy.parse('xy'), 3)
  t.is(x, 'x')
  t.is(y, 'y')
})

test('or', t => {
  const xy = string('x') | string('y')

  t.is(xy.parse('x'), 'x')
  t.is(xy.parse('y'), 'y')
})
