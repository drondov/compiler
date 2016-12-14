/**
 * For this grammar <id> and <number> is terminals.
 */
const GRAMMAR = {
  '<program>': 'program <id> begin <statements> end',
  '<statements>': '<statement> | <statements> <statement>',
  '<statement>': '<assign> ; | <read> ; | <write> ; | <loop> ; | <if> ;',
  '<assign>': '<id> := <expression>',
  '<read>': 'read ( <id> )',
  '<write>': 'write ( <id> )',
  '<loop>': 'while <expression> do { <statements> }',
  '<if>': 'if <expression> then { <statements> }',
  '<expression>': '( <expression> ) | <expression> + <expression> | <expression> – <expression> | <expression> * <expression> | <expression> / <expression> | <expression> < <expression> | <expression> > <expression> | <expression> == <expression> | <number> | <id>'
};


export default class SyntaxAnalyser {
  constructor(tokens) {
    this.tokens = tokens;
    const grammar = {};
    const grammarLeft = Object.keys(GRAMMAR);
    for (let i = 0; i < grammarLeft.length; ++i) {
      const left = grammarLeft[i];
      grammar[left] = GRAMMAR[left].split('|').map(x => x.split(/\s+/));
    }
    this.grammar = grammar;
    console.log('grammar');
    console.log(grammar);
  }

  analyze() {
    return resolve('<program>', this.tokens);
  }

  isTerminal(str) {
    if (str[0] !== '<' || str[str.length - 1] !== '>') return true;
    if (str === '<id>' || str === '<number>') return true;
    return false;
  }

  resolve(str, tokens) {
    const splited = str.split(/\s+/);
    const stack = [];
    for (let i = 0; tokens.length; ++i) {

    }
  }
}
