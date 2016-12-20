export default class SyntaxAnalyser {
  constructor(tokens) {
    this.tokens = tokens;
    this.i = 0;
  }

  analyze() {
    this.i = 0;
    return this.isProgram();
  }

  isProgram() {
    this.match(['program', { type: 'ID' }, '{']);
    this.isStatements();
    this.match('}');
    return this.isEnd();
  }

  isStatements() {
    // at least one statement according to grammar.
    if (!this.isStatement()) this.error(this.tokens[this.i], 'a statement');
    this.match(';');
    while (this.isStatement()) {
      this.match (';');
    }
    return true;
  }

  isStatement() {
    if (this.check('read') && this.isRead()) return true;
    if (this.check('write') && this.isWrite()) return true;
    if (this.check({ type: 'ID' }) && this.isAssign()) return true;
    if (this.check('if') && this.isIf()) return true;
    if (this.check('while') && this.isLoop()) return true;
    return false;
  }

  isRead() {
    this.match(['read', '(']);
    this.isExpression();
    return this.match(')');
  }

  isWrite() {
    this.match(['write', '(']);
    this.isExpression();
    return this.match(')');
  }

  isAssign() {
    this.match([{ type: 'ID' }, ':=']);
    return this.isExpression();
  }

  isIf() {
    this.match('if');
    this.isLogicalExpression();
    this.match(['then', '{']);
    this.isStatements();
    return this.match('}');
  }

  isLoop() {
    this.match('while');
    this.isLogicalExpression();
    this.match(['do', '{']);
    this.isStatements();
    return this.match('}');
  }

  isExpression() {
    this.isT();
    while (this.tryMatchEither(['+', '-'])) {
      this.isT();
    }
    return true;
  }

  isT() {
    this.isM();
    while(this.tryMatchEither(['*', '/'])) {
      this.isM();
    }
    return true;
  }

  isM() {
    if (this.tryMatch('-')) {
      return this.isT();
    }
    if (this.tryMatch({ type: 'NUMBER' })) return true;
    if (this.tryMatch({ type: 'ID' })) return true;
    if (this.tryMatch('(')) {
      this.isExpression();
      this.match(')');
      return true;
    }
    this.error(this.tokens[this.i], 'correct expression');
    return false;
  }

  isLogicalExpression() {
    this.isLT();
    while (this.tryMatch('|')) {
      this.isLT();
    }
    return true;
  }

  isLT() {
    this.isLM();
    while (this.tryMatch('&')) {
      this.isLM();
    }
    return true;
  }

  isLM() {
    if (this.tryMatch('(')) {
      this.isLogicalExpression();
      this.match(')');
      return true;
    }
    this.isExpression();
    if (this.matchEither(['<', '>', '='])) {
      return this.isExpression();
    }
  }

  isEnd() {
    if (this.i >= this.tokens.length) {
      return true;
    }
    this.error(this.tokens[this.i], 'end of program');
  }

  check(o) {
    if (typeof o === 'string' && this.tokens[this.i].text === o) return true;
    if (typeof o === 'object' && this.tokens[this.i].lexem.type === o.type) return true;
    return false;
  }

  tryMatchEither(array) {
    for (let j = 0; j < array.length; ++j) {
      if (this.tryMatch(array[j])) return true;
    }
    return false;
  }

  tryMatch(o) {
    if (this.check(o)) return this.match(o);
  }

  matchEither(array) {
    if (this.tryMatchEither(array)) return true;
    this.error(this.tokens[this.i], 'one of ' + array.map(x => '"' + x + '"').join(', '));
  }

  match(o) {
    if (Array.isArray(o)) return o.every(this.match, this);
    if (this.check(o)) {
      this.i++;
      return true;
    }
    this.error(this.tokens[this.i], o.type || o);
  }

  error(token, expected, rmShouldBe) {
    throw new Error('Syntax Error: token "' + token.text + '" at line '
      + token.line + (rmShouldBe ? '' : ' should be ') + expected);
  }
}
