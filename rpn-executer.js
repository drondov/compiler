import _ from 'lodash';

export default class RPNExecuter {
  constructor(data) {
    this.stack = [];
    this.i = 0;
    this.tokens = data.tokens;
    this.varTable = {};
  }

  write(a) {
    console.log('Output: ', a);
  }

  resolve(token) {
    if (typeof token === 'number') return token;
    if (token.lexem.type === 'NUMBER') return token.value;
    if (token.lexem.type === 'ID') {
      if (!(token.text in this.varTable)) {
        throw new Error(`Variable ${token.text} not found`);
      }
      return this.varTable[token.text];
    }
  }

  resolveJump(token) {
    for (let i = 0; i < this.tokens.length; ++i) {
      if (this.tokens[i].lexem.type === 'LABEL' && this.tokens[i].labelIndex === token.labelIndex) {
        // console.log('RESOLVED TO', this.tokens[i])
        return i;
      }
    }
    throw new Error('LABEL NOT FOUND');
  }

  applyOperator1(operator, a) {
    switch(operator.text) {
      case 'write': return this.write(this.resolve(a));
      case 'read':
        this.varTable[a.text] = 10;
        return;
    }
    throw new Error('Unknown operator');
  }

  applyOperator2(operator, a, b) {
    switch(operator.text) {
      case '*': return a * b;
      case '/': return a / b;
      case '+': return a + b;
      case '-': return a - b;
      case '>': return a > b;
      case '<': return a < b;
      case '&': return a && b;
      case '|': return a || b;
    }
    throw new Error('Unknown operator');
  }

  execute() {
    for (; this.i < this.tokens.length; ++this.i) {
      const token = this.tokens[this.i];
      // console.log('ITERATION', token);
      // console.log('STACK',this.stack.map(s => s.text).join(' '));
      // console.log('VARS', this.varTable);

      if (token.lexem.type === 'JNE') {
        if (this.stack.pop() === false) {
          this.i = this.resolveJump(token) - 1;
        }
        continue;
      }

      if (token.lexem.type === 'JMP') {
        this.i = this.resolveJump(token) - 1;
        continue;
      }


      if (token.lexem.type === 'LABEL') {
        continue;
      }

      if (token.lexem.type === 'ID' || token.lexem.type === 'NUMBER') {
        this.stack.push(token);
        continue;
      }

      if (token.text === ':=') {
        const b = this.stack.pop();
        const a = this.stack.pop();
        // console.log('OPERATION', a, token, b);
        this.varTable[a.text] = this.resolve(b);
        continue;
      }

      if (token.lexem.type === 'operator' && token.lexem.args === 2) {
        const b = this.resolve(this.stack.pop());
        const a = this.resolve(this.stack.pop());
        // console.log('OPERATION', a, token, b);
        const result = this.applyOperator2(token, a, b);

        if (typeof result !== 'undefined') {
          this.stack.push(result);
          // console.log('result', result);
        }
        continue;
      }

      if (token.lexem.type === 'operator' && token.lexem.args === 1) {
        const a = this.stack.pop();
        const result = this.applyOperator1(token, a);
        console.log('OPERATION', a, token);
        if (typeof result !== 'undefined') {
          this.stack.push(result);
          console.log('result', result);
        }
        continue;
      }

    }
  }
}