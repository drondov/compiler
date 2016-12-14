export default class Lexer {
	constructor(text) {
		this.lexems = [
			{ text: 'program', type: 'keyword' },
			{ text: 'begin', type: 'keyword' },
			{ text: 'end', type: 'keyword' },
			{ text: 'while', type: 'keyword' },
			{ text: 'do', type: 'keyword' },
			{ text: 'if', type: 'keyword' },
			{ text: 'then', type: 'keyword' },
			{ text: '}', type: 'keyword' },
			{ text: '{', type: 'keyword' },
			{ text: '(', type: 'operator' },
			{ text: ')', type: 'operator' },
			{ text: ':=', type: 'operator' },
			{ text: '==', type: 'operator' },
			{ text: '*', type: 'operator' },
			{ text: '/', type: 'operator' },
			{ text: '+', type: 'operator' },
			{ text: '-', type: 'operator' },
			{ text: '<', type: 'operator' },
			{ text: '>', type: 'operator' },
			{ text: ';', type: 'delimeter' },
			{ text: 'read', type: 'operator' },
			{ text: 'write', type: 'operator' },
			{ type: 'ID' },
			{ type: 'NUMBER' },
		];
		this.lexems.forEach((lexem, i) => lexem.code = i);
		this.constantTable = [];
		this.idTable = [];
		this.text = text;
	}

	findLexem(str) {
		for (let i = 0; i < this.lexems.length; ++i) {
			if (str === this.lexems[i].text) {
				return this.lexems[i];
			}
		}
		throw new Error('Lexem ' + str + 'doesn\'t found');
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
		const tokens = [];
		let lineNumber = 1;
		let lastLineBreak = 0;
		let i = 0;
		while (i < this.text.length) {
			let char = this.text[i];

			// BLANK CHARACTERS
			if (char === ' ' || char === '\r' || char === '\t') {
				i++;
				continue;
			}
			if (char === '\n') {
				lastLineBreak = i;
				lineNumber++;
				i++;
				continue;
			}
			const token = {
				text: '',
				line: lineNumber,
				start: i,
				startFromLine: i - lastLineBreak
			};
			if (char === ';') {
				token.end = i;
				token.lexem = this.findLexem(';');
				token.text = char;
				tokens.push(token);
				i++;
				continue;
			}
			if (char === ':') {
				i++;
				char = this.text[i];
				if (char !== '=') {
					throw new Error('Unexpected : at line ' + token.line + ', position ' + token.startFromLine);
				}
				token.text = ':=';
				token.end = i;
				token.lexem = this.findLexem(':=');
				tokens.push(token);
				i++;
				continue;
			}
			if (isLetter(char)) {
				while (isLetter(char) || isDigit(char)) {
					token.text += char;
					i++;
					char = this.text[i];
				}
				token.end = i;
				token.value = token.text;
				try {
					token.lexem = this.findLexem(token.text);
				} catch (e) {
					token.lexem = this.findLexemByType('ID');
					token.idRef = this.addToIdTable(token);
				}
				tokens.push(token);
				continue;
			}

			if (isOP(char)) {
				token.text = char;
				token.value = token.text;
				token.lexem = this.findLexem(token.text);
				tokens.push(token);
				i++;
				continue;
			}

			if (isDigit(char)) {
				let wasDot = false;
				while (isDigit(char) || char === '.') {
					if (char === '.' && wasDot) {
						throw new Error('Incorrect number format at line ' + token.line + ', position ' + i);
					}
					if (char === '.') wasDot = true;
					token.text += char;
					i++;
					char = this.text[i];
				}
				token.end = i;
				token.value = parseFloat(token.text);
				token.lexem = this.findLexemByType('NUMBER');
				if (!isNumber(token.value)) {
					throw new Error('Incorrect number format at line ' + token.line + ', position ' + token.startFromLine);
				}
				if (isLetter(char)) {
					throw new Error('Incorrect number format at line ' + lineNumber + ', position ' + (i - lastLineBreak));
				}
				token.constantRef = this.addToConstantTable(token);
				tokens.push(token);
				continue;
			}
			throw new Error('Undefined character ' + this.text[i] + ' at position ' + i);
		}
		this.tokens = tokens;
		return {
			tokens,
			constantTable: this.constantTable,
			idTable: this.idTable,
		};
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


function isLetter(c) {
	return /^[a-z]$/i.test(c);
}

function isDigit(c) {
	return /^[0-9]$/.test(c);
}

function isOP(c) {
	return /^[-*+<>{};()]$/.test(c);
}

function isNumber(str) {
	return /^[0-9]+(?:\.[0-9]*)?$/.test(str);
}

// function test() {
// 	var fs = require('fs');
// 	var text = fs.readFileSync('./test.cl').toString();
// 	var lexer = new Lexer(text);
// 	var tokens = lexer.lex();
// 	console.log(tokens);
// 	// console.log(tokens);
// }

// test();
