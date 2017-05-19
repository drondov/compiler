import React from 'react';

import Lexer from '../lexer';
import SyntaxAnalyser from '../syntax-analyzer';

import ConstantTable from './ConstantTable';
import IdTable from './IdTable';
import Lexems from './Lexems';
import Errors from './Errors';
import Console from './Console';


// const defaultProgram = `
// program fib {
// 	i := 0;
// 	a := 0;
// 	b := 1;
// 	read(n);
// 	while i < n do {
// 		new := a + b;
// 		a := b;
// 		b := new;
// 		i := i + 1;
// 	};
// 	write(b);
// }
// `.trim();

const defaultProgram = `
program sumProgression {
	read(max);
	sum := 0;
	i := max;
	while i > 0 do {
		sum := sum + i;
		i := i - 1;
	};
	write(sum);
}
`.trim();

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			program: defaultProgram,
		}
	}
	onKeyUp(event) {
		const program = event.target.value;
		this.setState({ program });
	}
	onKeyDown(event) {
		if (event.keyCode === 9) {
			const pos = event.target.selectionStart;
			const text = event.target.value;

			event.target.value = text.slice(0, pos) + '\t' + text.slice(pos);
			event.target.selectionStart = pos + 1;
			event.target.selectionEnd = pos + 1;
			event.preventDefault();
			return false;
		}
		console.log(event.keyCode);
	}

	render() {
		const lexer = new Lexer(this.state.program);
		let error = null;
		try {
			this.lexerData = lexer.lex();
			const syntaxAnalyser = new SyntaxAnalyser(this.lexerData.tokens);
			syntaxAnalyser.analyze();

		} catch (e) {
			this.lexerData.error = e.message;
			console.error(e);
			error = e.message;
		}
		console.log(this.lexerData)
		return (
			<div>
				<div className="row">
					<textarea
						className="text-editor small-3 large-3 columns"
						onKeyUp={this.onKeyUp.bind(this)}
						onKeyDown={this.onKeyDown.bind(this)}
						defaultValue={this.state.program}>
					</textarea>
					<div className="small-3 large-3 columns">
						<h3>Constant Table</h3>
						<ConstantTable constants={this.lexerData.constantTable}/>
						<h3>Id Table</h3>
						<IdTable ids={this.lexerData.idTable}/>
					</div>
					<div className="small-3 large-3 columns">
						<h3>Console</h3>
						<Console lexerData={this.lexerData} />
					</div>
				</div>
				<div>
					{error && <Errors error={error}/>}
				</div>
				<div className="row">
					<Lexems className="small-2 large-4 columns" tokens={this.lexerData.tokens}/>
				</div>
			</div>
		)
	}
}
