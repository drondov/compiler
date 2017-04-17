import React from 'react';

import Lexer from '../lexer';
import SyntaxAnalyser from '../syntax-analyzer';

import ConstantTable from './ConstantTable';
import IdTable from './IdTable';
import Lexems from './Lexems';
import Errors from './Errors';


const defaultProgram = `
program sum100 {
	i := 100;
	sum := 0;
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
						<ConstantTable constants={this.lexerData.constantTable}/>
					</div>
					<div className="small-3 large-3 columns">
						<IdTable ids={this.lexerData.idTable}/>
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
