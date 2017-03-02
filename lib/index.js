function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}

function count(arr, item, start, end) {
  let c = 0
  for (var i = 0, l = arr.length; i < Math.min(l, end); i++) {
    if (arr[i] === item) {
      c++
    }
  }
  return c
}

function lineInfoAt(stream, index) {
  if (index > stream.length) {
    throw Error('invalid index')
  }
  let cs = stream.split('')
  let line = count(cs, '\n', index)
  let lastNl = count(cs.reverse(), '\n', index) || -1
  let col = index - (lastNl + 1)
  return [line, col]
}

class Result {
  constructor(status, index, value, furthest, expected) {
    this.status = status
    this.index = index
    this.value = value
    this.furthest = furthest
    this.expected = expected
  }

  static success(index, value) {
    return new Result(true, index, value, -1, void 0)
  }

  static failure(index, expected) {
    return new Result(false, -1, void 0, index, expected)
  }

  aggregate(other) {
    if (!other) {
      return this
    }
    if (this.furthest >= other.furthest) {
      return this
    }
    return new Result(
      this.status, this.index, this.value, other.furthest, other.expected
    )
  }
}

class ParseError extends Error {
  constructor(expected, stream, index) {
    let s = ''
    try {
      let [line, col] = lineInfoAt(stream, index)
      s = `${line}:${col}`
    } catch(e) {
      s = 'error'
    }
    super(`Expected ${expected} at ${s}`)
    this.expected = expected
    this.stream = stream
    this.index = index
  }
}

class Parser {
  constructor(func) {
    this.func = func
  }

  call(stream, index) {
    return this.func(stream, index)
  }

  parse(str) {
    const res = (this.lshift(eof)).parsePartial(str)
    return res[0]
  }

  parsePartial(str) {
    const t = getType(str)
    if (t !== 'String') {
      throw Error(`Only parse string, ${t} found!`)
    }
    const res = this.call(str, 0)
    if (res.status) {
      return [res.value, str.slice(res.index)]
    }
    throw new ParseError(res.expected, str, res.furthest)
  }

  bind(boundFun) {
    return parser((stream, index) => {
      const res = this.call(stream, index)
      if (res.status) {
        const nextParser = boundFun(res.value)
        return nextParser.call(stream, res.index).aggregate(res)
      }
      return res
    })
  }

  map(mapFun) {
    return this.bind(res => success(mapFun(res)))
  }

  then(other) {
    return seq(this, other).map(r => r[1])
  }

  skip(other) {
    return seq(this, other).map(r => r[0])
  }

  result(res) {
    return this >> success(res)
  }

  many() {
    return this.times(0, Infinity)
  }

  times(min, max) {
    max = max || min

    return parser((stream, index) => {
      let values = []
      let times = 0
      let res

      while (times < max) {
        res = this.call(stream, index).aggregate(res)
        if (res.status) {
          values.push(res.value)
          index = res.index
          times += 1
        } else if (times >= min) {
          break
        }
        return res
      }

      return Result.success(index, values).aggregate(res)
    })
  }

  atMost(n) {
    return this.times(0, n)
  }

  atLeast(n) {
    return this.times(n) + this.many()
  }

  desc(desc) {
    const f = fail(desc)
    return this.or(f)
  }

  mark() {
    const self = this
    return generate(function*() {
      const start = yield lineInfo
      const body = yield self
      const end = yield lineInfo
      return [start, body, end]
    })
  }

  plus(right) {
    return seq(this, right).map(res => res[0] + res[1])
  }

  multiply(right) {
    return this.times(right)
  }

  or(right) {
    return alt(this, right)
  }

  rshift(right) {
    return this.then(right)
  }

  lshift(right) {
    return this.skip(right)
  }
}

function alt(...parsers) {
  if (!parsers) {
    return fail('<Empty alt>')
  }

  return parser((stream, index) => {
    let res
    for (var i = 0, l = parsers.length; i < l; i++) {
      var _parser = parsers[i]
      res = _parser.call(stream, index).aggregate(res)
      if (res.status) {
        return res
      }
    }
    return res
  })
}

function seq(...parsers) {
  if (!parsers) {
    return success([])
  }

  return parser((stream, index) => {
    let res
    let values = []

    for (var i = 0, l = parsers.length; i < l; i++) {
      var _parser = parsers[i]
      res = _parser.call(stream, index).aggregate(res)
      if (!res.status) {
        return res
      }
      index = res.index
      values.push(res.value)
    }
    return Result.success(index, values).aggregate(res)
  })
}

export function parser(fun) {
  return new Parser(fun)
}

export function generate(fun) {
  if (getType(fun) === 'String') {
    return f => generate(f).desc(fun)
  }

  return parser((stream, index) => {
    const g = fun()

    let res
    let value
    let nextParser

    while (!(nextParser = g.next(value)).done) {
      res = nextParser.value.call(stream, index).aggregate(res)
      if (!res.status) {
        return res
      }
      value = res.value
      index = res.index
    }

    const returnVal = nextParser.value
    if (returnVal instanceof Parser) {
      return returnVal(stream, index).aggregate(res)
    }

    return Result.success(index, returnVal).aggregate(res)

  }).desc(fun.name)
}

export const index = new Parser((_, index) => Result.success(index, index))
export const lineInfo = new Parser((stream, index) => Result.success(index, lineInfoAt(stream, index)))

function success(val) {
  return new Parser((_, index) => Result.success(index, val))
}

function fail(expected) {
  return new Parser((_, index) => Result.failure(index, expected))
}

export function string(s) {
  const sl = s.length

  const stringParser = parser((stream, index) => {
    if (stream.slice(index, index + sl) === s) {
      return Result.success(index + sl, s)
    } else {
      return Result.failure(index, s)
    }
  })

  stringParser.name = `stringParser<${s}>`

  return stringParser
}

export function regex(exp) {
  if (getType(exp) === 'String') {
    exp = new RegExp(exp)
  }

  const regexParser = parser((stream, index) => {
    const _stream = stream.slice(index)
    const match = _stream.match(exp)
    if (match) {
      index = match.index + match[0].length + index
      return Result.success(index, match[0])
    }
    return Result.failure(index, exp.toString())
  })

  regexParser.name = `regexParser<${exp.toString()}>`

  return regexParser
}

export const whitespace = regex('\s+')

export const eof = parser((stream, index) => {
  if (index >= stream.length) {
    return Result.success(index, void 0)
  }
  return Result.failure(index, 'EOF')
});

export const or = (left, right) => {
  if (left instanceof Parser) {
    return left.or(right)
  }
  return left | right
}

export const plus = (left, right) => {
  if (left instanceof Parser) {
    return left.plus(right)
  }
  return left + right
}

export const lshift = (left, right) => {
  if (left instanceof Parser) {
    return left.lshift(right)
  }
  return left << right
}

export const rshift = (left, right) => {
  if (left instanceof Parser) {
    return left.rshift(right)
  }
  return left >> right
}

export const bind = (left, right) => left.bind(right)
