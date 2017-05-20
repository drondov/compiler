import _ from 'lodash';
import { debugLog } from './utils';

export default class RPNExecuter {
  constructor(data) {
    this.stack = [];
    this.i = 0;
    this.tokens = data.tokens;
    this.labelList = data.labelList;
    this.varTable = {};
    this.logs = [];
    this.pause = false;
    this.pauseVariable = null;
  }

  continue(data) {
    if (!this.pause) throw new Error('Program is not paused!');
    this.pause = false;
    this.varTable[this.pauseVariable] = data;
    this.execute();
  }

  write(a) {
    this.logs.push(`Output: ${a}`);
  }

  resolve(token) {
    if (typeof token === 'number') return token;
    if (typeof token === 'boolean') return token;
    if (token.lexem.type === 'NUMBER') return token.value;
    if (token.lexem.type === 'ID') {
      if (!(token.text in this.varTable)) {
        throw new Error(`Variable ${token.text} not found`);
      }
      return this.varTable[token.text];
    }
  }

  resolveJump(token) {
    if (void 0 === this.labelList[token.labelIndex]) {
      throw new Error(`LABEL WITH INDEX ${token.labelIndex} NOT FOUND`);
    }
    return this.labelList[token.labelIndex];
  }

  applyOperator1(operator, a) {
    switch(operator.text) {
      case 'write': return this.write(this.resolve(a));
      case 'read':
        this.pauseVariable = a.text;
        this.pause = true;
        return;
      case '@':
        return -this.resolve(a);
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
      debugLog('ITERATION', token);
      debugLog('STACK',this.stack.map(s => s.text).join(' '));
      debugLog('VARS', this.varTable);

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
        debugLog('OPERATION', a, token, b);
        this.varTable[a.text] = this.resolve(b);
        continue;
      }

      if (token.lexem.type === 'operator' && token.lexem.args === 2) {
        const b = this.resolve(this.stack.pop());
        const a = this.resolve(this.stack.pop());
        debugLog('OPERATION', a, token, b);
        const result = this.applyOperator2(token, a, b);

        if (typeof result !== 'undefined') {
          this.stack.push(result);
          debugLog('result', result);
        }
        continue;
      }

      if (token.lexem.type === 'operator' && token.lexem.args === 1) {
        const a = this.stack.pop();
        const result = this.applyOperator1(token, a);
        if (this.pause) {
          this.i++;
          break;
        }
        debugLog('OPERATION', a, token);
        if (typeof result !== 'undefined') {
          this.stack.push(result);
          debugLog('result', result);
        }
        continue;
      }

    }
  }
}
