import test from 'ava'
import { letter, digit, regex, string, generate, or, plus, rshift, lshift } from '../lib'

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

  const _parser = string('"')
  t.is(_parser.parse('"'), '"')
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

test('many', t => {
  const letters = letter.many()
  t.deepEqual(letters.parse('x'), ['x'])
  t.deepEqual(letters.parse('xyz'), ['x', 'y', 'z'])
  t.deepEqual(letters.parse(''), [])
})

test('many with then', t => {
  const parser = string('x').many() >> string('y')
  t.deepEqual(parser.parse('y'), 'y')
  t.deepEqual(parser.parse('xy'), 'y')
  t.deepEqual(parser.parse('xxxxxy'), 'y')
})

test('times', t => {
  const threeLetters = letter.times(3)
  t.deepEqual(threeLetters.parse('xyz'), ['x', 'y', 'z'])

  t.throws(() =>{threeLetters.parse('xy')})
  t.throws(() =>{threeLetters.parse('xyzw')})
})

test('times with then', t => {
  const thenDigit = letter.times(3) >> digit
  t.is(thenDigit.parse('xyz1'), '1')

  t.throws(() =>{thenDigit.parse('xy1')})
  t.throws(() =>{thenDigit.parse('xyz')})
  t.throws(() =>{thenDigit.parse('xyzw')})
})

test('times with min and max', t => {
  const someLetters = letter.times(2, 4)

  t.deepEqual(someLetters.parse('xy'), ['x', 'y'])
  t.deepEqual(someLetters.parse('xyz'), ['x', 'y', 'z'])
  t.deepEqual(someLetters.parse('xyzw'), ['x', 'y', 'z', 'w'])

  t.throws(() =>{someLetters.parse('x')})
  t.throws(() =>{someLetters.parse('xyzwv')})
})

test('times with min and max and then', t => {
  const thenDigit = letter.times(2, 4) >> digit

  t.deepEqual(thenDigit.parse('xy1'), '1')
  t.deepEqual(thenDigit.parse('xyz1'), '1')
  t.deepEqual(thenDigit.parse('xyzw1'), '1')

  t.throws(() =>{thenDigit.parse('xy')})
  t.throws(() =>{thenDigit.parse('xyzw')})
  t.throws(() =>{thenDigit.parse('xyzwv1')})
  t.throws(() =>{thenDigit.parse('x1')})
})

test('times zero', t => {
  const zeroLetters = letter.times(0)
  t.deepEqual(zeroLetters.parse(''), [])

  t.throws(() =>{zeroLetters.parse('x')})
})
