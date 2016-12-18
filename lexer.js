export default class Lexer {
	constructor(text) {
		this.lexems = [
			{ text: 'program', type: 'keyword' },
			{ text: 'while', type: 'keyword' },
			{ text: 'do', type: 'keyword' },
			{ text: 'if', type: 'keyword' },
			{ text: 'then', type: 'keyword' },
			{ text: '}', type: 'keyword' },
			{ text: '{', type: 'keyword' },
			{ text: '(', type: 'operator' },
			{ text: ')', type: 'operator' },
			{ text: ':=', type: 'statement' },
			{ text: '*', type: 'operator' },
			{ text: '/', type: 'operator' },
			{ text: '+', type: 'operator' },
			{ text: '-', type: 'operator' },
			{ text: '|', type: 'operator' },
			{ text: '&', type: 'loperator' },
			{ text: '<', type: 'loperator' },
			{ text: '>', type: 'loperator' },
			{ text: '=', type: 'loperator' },
			{ text: ';', type: 'delimeter' },
			{ text: 'read', type: 'statement' },
			{ text: 'write', type: 'statement' },
			{ type: 'ID' },
			{ type: 'NUMBER' },
		];
		this.lexems.forEach((lexem, i) => lexem.code = i);
		this.constantTable = [];
		this.idTable = [];
		this.text = text + '\n'; //  костыль %)
	}

	findLexem(str) {
		for (let i = 0; i < this.lexems.length; ++i) {
			if (str === this.lexems[i].text) {
				return this.lexems[i];
			}
		}
		throw new Error('Lexem ' + str + ' doesn\'t found');
	}
	findLexemByType(str) {
		for (let i = 0; i < this.lexems.length; ++i) {
			if (str === this.lexems[i].type) {
				return this.lexems[i];
			}
		}
		throw new Error('Lexem with type ' + str + ' doesn\'t found');
	}

	lex() {
		const STATE_INITIAL = 1;
		const STATE_WORD = 10;

		const STATE_NUMBER = 20;
		const STATE_NUMBER_E = 200;
		const STATE_NUMBER_E_AFTER = 2000;
		const STATE_NUMBER_DOT = 201;
		const STATE_NUMBER_DOT_AFTER = 2010;

		const STATE_COLON = 30;
		const self = this;
		const tokens = [];
		let state = STATE_INITIAL;
		let currentText = '';
		let lineNo = 1;
		let lastBreak = 0;
		let posBeforeBreak = 0;
		for (var i = 0; i < this.text.length; ++i) {
			let char = this.text[i];
			currentText += char;
			switch(state) {
				case STATE_INITIAL:
					if (isSpace(char)) {
						if (char === '\n') {
							lineNo++;
							lastBreak = 0;
						}
						currentText = '';
						continue;
					} else {
						currentText = char;
					}
					posBeforeBreak = i - lastBreak;
					if (isLetter(char)) {
						state = STATE_WORD;
						continue;
					}
					if (isDigit(char)) {
						state = STATE_NUMBER;
						continue;
					}
					if (isOP(char)) {
						addOpToken();
						continue;
					}
					if (char === ':') {
						state = STATE_COLON;
						continue;
					}
					this.eUnexpectedChar(char, lineNo, posBeforeBreak);
				case STATE_COLON:
					if (char === '=') {
						addOpToken();
						continue;
					}
					this.eUnexpectedChar(char, lineNo, posBeforeBreak);
				case STATE_WORD:
					if (isLetter(char) || isNumber(char)) {
						continue;
					}
					addWordToken();
					// rollback
					continue;
				case STATE_NUMBER:
					if (isDigit(char)) {
						state = STATE_NUMBER;
						continue;
					}
					if (char === '.') {
						state = STATE_NUMBER_DOT;
						continue;
					}
					if (char.toLowerCase() === 'e') {
						i++;
						char = this.text[i];
						if (['-', '+'].includes(char)) {
							state = STATE_NUMBER_E;
							currentText += char;
							continue;
						}
						this.eUnexpectedChar(char, lineNo, posBeforeBreak);
					}
					addNumberToken();
					continue;
				case STATE_NUMBER_DOT:
					if (isDigit(char)) {
						state = STATE_NUMBER_DOT_AFTER;
						continue;
					}
					// at least one digit after dot.
					this.eUnexpectedChar(char, lineNo, posBeforeBreak);
				case STATE_NUMBER_DOT_AFTER:
					if (isDigit(char)) {
						state = STATE_NUMBER_DOT_AFTER;
						continue;
					}
					if (char.toLowerCase() === 'e') {
						i++;
						char = this.text[i];
						if (['-', '+'].includes(char)) {
							state = STATE_NUMBER_E;
							currentText += char;
							continue;
						}
						this.eUnexpectedChar(char, lineNo, posBeforeBreak);
					}
					if (isLetter(char)) {
						this.eUnexpectedChar(char, lineNo, posBeforeBreak);
					}
					addNumberToken();
					continue;
				case STATE_NUMBER_E:
					if (isDigit(char)) {
						state = STATE_NUMBER_E_AFTER;
						continue;
					}
					// at least one digit after e.
					this.eUnexpectedChar(char, lineNo, posBeforeBreak);
				case STATE_NUMBER_E_AFTER:
					if (isDigit(char)) {
						continue;
					}
					if (isLetter(char)) {
						this.eUnexpectedChar(char, lineNo, posBeforeBreak);
					}
					addNumberToken();
					continue;
				default:
					throw new Error('State ' + state + ' doesn\'t found');
			}
		}

		function addOpToken() {
			state = STATE_INITIAL;
			tokens.push({
				lexem: self.findLexem(currentText),
				text: currentText,
				value: currentText,
				line: lineNo,
			});
		}
		function addOrdToken() {
			state = STATE_INITIAL;
			i--;
			currentText = currentText.slice(0, -1);
			tokens.push({
				lexem: self.findLexem(currentText),
				text: currentText,
				value: currentText,
				line: lineNo,
			});
		}
		function addNumberToken() {
			state = STATE_INITIAL;
			i--;
			currentText = currentText.slice(0, -1);
			tokens.push({
				lexem: self.findLexemByType('NUMBER'),
				text: currentText,
				value: parseFloat(currentText),
				line: lineNo,
			});
			const token = tokens[tokens.length - 1];
			token.constantRef = self.addToConstantTable(token);
		}
		function addWordToken() {
			state = STATE_INITIAL;
			i--;
			const text = currentText.slice(0, -1);
			let lexem = null;
			try {
				lexem = self.findLexem(text);
			} catch (e) {
				lexem = self.findLexemByType('ID');
			}

			tokens.push({
				lexem,
				text: text,
				value: text,
				line: lineNo,
			});
			if (lexem.type === 'ID') {
				const token = tokens[tokens.length - 1];
				token.idRef = self.addToIdTable(token);
			}
		}
		return {
			tokens: tokens,
			constantTable: this.constantTable,
			idTable: this.idTable,
		};
	}

	eUnexpectedChar(text, line, position) {
		throw new Error('Unexpected ' + text + ' at line '
			+ line + ', position ' + position);
	}

	addToConstantTable(token) {
		const table = this.constantTable;
		for (let i = 0; i < table.length; ++i) {
			if (table[i].type === token.lexem.type && table[i].value === token.value) {
				return i;
			}
		}
		// if not found in table
		table.push({
			value: token.value,
			type: token.lexem.type,
		});
		return table.length - 1;
	}

	addToIdTable(token) {
		if (token.lexem.type !== 'ID') {
			throw new Error('Can not add non-ID token to ID Table');
		}
		const table = this.idTable;
		for (let i = 0; i < table.length; ++i) {
			if (table[i].value === token.value) {
				return i;
			}
		}
		// if not found in table
		table.push({
			value: token.value,
		});
		return table.length - 1;
	}
}

function isSpace(c) {
	return ['\n', '\r', '\t', ' '].includes(c);
}

function isLetter(c) {
	return /^[a-z]$/i.test(c);
}

function isDigit(c) {
	return /^[0-9]$/.test(c);
}

function isOP(c) {
	return /^[-*+<>{};()=&|]$/.test(c);
}

function isNumber(str) {
	return /^[0-9]+(?:\.[0-9]*)?$/.test(str);
}
