/**
 * For this grammar <id> and <number> is terminals.
 */
const GRAMMAR = [
  {left: '<program>', right: 'program <id> { <statements> }'},
  {left: '<statements>', right: '<statement> | <statements> <statement>'},
  {left: '<statement>', right: '<assign> ; | <read> ; | <write> ; | <loop> ; | <if> ;'},
  {left: '<assign>', right: '<id> := <expression>'},
  {left: '<read>', right: 'read ( <id> )'},
  {left: '<write>', right: 'write ( <id> )'},
  {left: '<loop>', right: 'while <expression> do { <statements> }'},
  {left: '<if>', right: 'if <expression> then { <statements> }'},
  {left: '<expression>', right: '( <expression> ) | <expression> + <expression> | <expression> – <expression> | <expression> * <expression> | <expression> / <expression> | <expression> < <expression> | <expression> > <expression> | <expression> == <expression> | <number> | <id>'}
];


export default class SyntaxAnalyser {
  constructor(tokens) {
    this.tokens = tokens;
    const grammar = [];
    for (let i = 0; i < GRAMMAR.length; ++i) {
      grammar.push({
        left: GRAMMAR[i].left,
        right: GRAMMAR[i].right.split('|').map(x => x.split(/\s+/))
      });
    }
    this.grammar = grammar;
    console.log('grammar');
    console.log(grammar);
  }

  analyze() {
    return this.resolve('<program>', this.tokens);
  }

  isTerminal(str) {
    const terminals = ['<id>', '<number>'];
    if (str[0] !== '<' || str[str.length - 1] !== '>') return true;
    if (terminals.includes(str)) return true;
    return false;
  }

  hasLeftRecursion(rule) {
    return _.flatten(rule.right).some(x => rule.left === x);
  }

  getTerminalAlternatives(rule) {
    const terminalAlts = [];
    for (let i = 0; i < rule.right.length; ++i) {
      if (rule.right[i].every(crule => this.isTerminal(crule))) {
        terminalAlts.push(rule.right[i]);
      }
    }
    return terminalAlts;
  }

  resolveLeftRecursion(rule) {
    if (!this.hasLeftRecursion(rule)) return false;
    let startTokens = [];
    let endTokens = [];
    return function(tokens) {

    }
  }

  findRule(str) {
    for (let i = 0; i < this.grammar.length; ++i) {
      if (this.grammar[i].left === str) return this.grammar[i];
    }
    throw new Error('Rule for ' + str + ' not found.');
  }

  isCorrect(crule, tokens) {
    console.log('rule', crule)
    for (let i = 0; i < crule.length; ++i) {
      console.log(crule[i]);
      if (crule[i] === '<id>') {
        if (tokens[i].lexem.type === 'ID') continue;
        this.error(tokens[i], 'an Identifier');
      }
      if (crule[i] === '<number>') {
        if (tokens[i].lexem.type === 'a NUMBER') continue;
        this.error(tokens[i], 'a Number');
      }
      if (this.isTerminal(crule[i])) {
        if (crule[i] === tokens[i].text) continue;
        this.error(tokens[i], crule[i]);
      }
      return false;
    }
    return true;
  }

  error(token, expected) {
    throw new Error('Syntax Error: token "' + token.text + '" at line '
      + token.line + ' should be ' + expected);
  }

  resolve(str, tokens) {
    const splited = str.split(/\s+/);
    for (let i = 0; i < splited.length; ++i) {
      const part = splited[i];
      const rule = this.findRule(part);
      for (let j = 0; j < rule.right.length; ++j) {
        if (this.isCorrect(rule.right[j], tokens)) return true;
      }
      return false;
      // const leftRecursion = this.findLeftRecursion(rule);
    }
  }
}
