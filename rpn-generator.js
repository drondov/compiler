import _ from 'lodash';

const precedenceTable = {
	'/': 11,
	'*': 11,
	'+': 10,
	'-': 10,
	'>': 8,
  '<': 8,
  '=': 8,
  '&': 7,
  '|': 6,
	':=': 3,
	'write': 3,
	'read': 3,
  '(': 2,
  'if': 2,
};

function getPrecendence(token) {
	const precedence = precedenceTable[token.text];
	if (precedence) {
		return precedence;
	}
	throw new Error(`Not found operator '${token.text}' in precedence table`);
}

function top(stack) {
	return stack[stack.length - 1];
} 

export default class RPNGenerator {
	generate(lexerData) {
		// remove unnecessary tokens. `Program` `IDN` `{` ... `}`
		const tokens = _
			.cloneDeep(lexerData.tokens);
		tokens.splice(0, 3);
		tokens.splice(-1, 1);

		const stack = [];
		const result = [];
		for (let i = 0; i < tokens.length; ++i) {
			const token = tokens[i];

			if (token.lexem.type === 'delimiter') {
				result.push(...stack.reverse());
				stack.splice(0);

				result.push(token);
				continue;
			}

			if (token.lexem.type === 'NUMBER' || token.lexem.type === 'ID') {
				result.push(token);
				continue;
			}

			if (token.text === '(') {
				stack.push(token);
				continue;
			}

			if (token.text === ')') {
				while (top(stack).text !== '(') {
					result.push(stack.pop());
				}
				stack.pop();
				continue;
			}

			if (token.lexem.type === 'operator' || ['write', 'read'].includes(token.text)) {
				while (stack.length && getPrecendence(top(stack)) >= getPrecendence(token)) {
					result.push(stack.pop());
				}
				stack.push(token);
				continue;
			}

			if (token.text === 'then') {
        result.push(...stack.reverse());
        stack.splice(0);

        result.push(token);
				continue;
			}

			// stack.push(token);
			continue;

			throw new Error('Undefined token.');
		}
		// pop all elements into `result`.
		result.push(...stack.reverse());
		return result;
	}
}