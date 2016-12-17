function InnerError(message) {
  this.constructor.prototype.__proto__ = Error.prototype;
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

export default class SyntaxAnalyser {
  constructor(tokens) {
    this.tokens = tokens;
    this.i = 0;
  }

  analyze() {
    this.isProgram(this.tokens);
  }

  isProgram(tokens) {
    this.check('program', tokens[0]);
    this.check({ type: 'ID' }, tokens[1]);
    this.check('{', tokens[2]);
    this.isStatements(tokens.slice(3, -1));
    this.check('}', tokens[tokens.length - 1]);
  }

  isStatements(tokens) {
    for (let i = 0; i < tokens.length; ++i) {
      let currentStatement = [];
      let brackets = 0;
      while (i < tokens.length && (tokens[i].text !== ';' || brackets !== 0)) {
        if (tokens[i].text === '{') brackets++;
        if (tokens[i].text === '}') brackets--;
        currentStatement.push(tokens[i]);
        i++;
      }
      if (brackets < 0) this.error(tokens[tokens.length - 1], ' missing open bracket', true);
      if (brackets > 0) this.error(tokens[tokens.length - 1], ' missing close bracket', true);
      this.isStatement(currentStatement);
      currentStatement = [];
    }
    if (tokens[tokens.length - 1].text !== ';') this.error(tokens[tokens.length - 1], 'a semicolon');
  }

  isStatement(tokens) {
    const possibilities = ['isAssign', 'isWrite', 'isRead', 'isLoop', 'isIf'];
    const isValid = possibilities.some(fName => {
      try {
        this[fName](tokens);

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    });
    if (!isValid) this.error(tokens[0], 'a statement');
    return true;
  }

  isIf(tokens) {
    this.check('if', tokens[0]);
    const expr = [];
    let startOfStatements = -1;
    for (let i = 1; i < tokens.length; ++i) {
      if (tokens[i].text === 'then' && tokens[i + 1].text === '{') {
        startOfStatements = i + 2;
        break;
      }
      expr.push(tokens[i]);
    }
    if (!expr.length && startOfStatements !== -1) {
      this.error(tokens[0], 'an expression after if keyword');
    }
    this.isExpression(expr);
    this.isStatements(tokens.slice(startOfStatements, -1));
    this.check('}', tokens[tokens.length - 1]);
  }

  isLoop(tokens) {
    this.check('while', tokens[0]);
    const expr = [];
    let startOfStatements = -1;
    for (let i = 1; i < tokens.length; ++i) {
      if (tokens[i].text === 'do' && tokens[i + 1].text === '{') {
        startOfStatements = i + 2;
        break;
      }
      expr.push(tokens[i]);
    }
    if (!expr.length && startOfStatements !== -1) {
      this.error(tokens[0], 'an expression after while keyword');
    }
    this.isExpression(expr);
    this.isStatements(tokens.slice(startOfStatements, -1));
    this.check('}', tokens[tokens.length - 1]);
  }

  isWrite(tokens) {
    this.check('write', tokens[0]);
    this.check('(', tokens[1]);
    this.check({ type: 'ID' }, tokens[2]);
    this.check(')', tokens[3]);
  }

  isRead(tokens) {
    this.check('read', tokens[0]);
    this.check('(', tokens[1]);
    this.check({ type: 'ID' }, tokens[2]);
    this.check(')', tokens[3]);
  }

  isAssign(tokens) {
    this.check({ type: 'ID' }, tokens[0]);
    this.check(':=', tokens[1]);
    console.log('assign', tokens.slice(2))
    this.isExpression(tokens.slice(2));
  }

  isExpression(tokens) {
    if (tokens.length === 1 && (tokens[0].lexem.type === 'ID' || tokens[0].lexem.type == 'NUMBER')) {
      return true;
    }
    if (tokens[0].text === '(') {
      this.check(')', tokens[tokens.length - 1]);
      return this.isExpression(tokens.slice(1, -1));
    }
    if (tokens[0].text !== '(' && tokens[0].lexem.type !== 'ID' && tokens[0].lexem.type !== 'NUMBER') {
      this.error(tokens[0], 'should be id|number|(', true);
    }
    this.check({ type: 'operator' }, tokens[1]);

    let rightOperand = [];
    // if (tokens[2].text === '(') {
    rightOperand = tokens.slice(2);
    // } else {
    //   let brackets = 0;
    //   for (let i = 2; i < tokens.length; ++i) {
    //     if (tokens[i].text === ')' && brackets === 0 && i > 2) break;
    //     if (tokens[i].text === '(') brackets++;
    //     if (tokens[i].text === ')') brackets++;
    //     rightOperand.push(tokens[i]);
    //   }
    // }
    console.log('right', rightOperand);
    this.isExpression(rightOperand);

    return true;
  }

  check(rule, token) {
    console.log('check', rule);
    if (typeof rule === 'string') {
      if (rule !== token.text) this.error(token, rule);
      return true;
    }
    if (rule instanceof Object && rule.type) {
      if (rule.type !== token.lexem.type) this.error(token, 'a type of ' + rule.type);
      return true;
    }
    throw new Error('Check is invalid rule: ' + rule + ', token: ' + JSON.stringify(token));
  }



  error(token, expected, rmShouldBe) {
    throw new Error('Syntax Error: token "' + token.text + '" at line '
      + token.line + (rmShouldBe ? '' : ' should be ') + expected);
  }

}
