import React from 'react';

import Lexems from './Lexems';
import SyntaxAnalyser from './syntax-analyser';
import ConstantTable from './ConstantTable';
import IdTable from './IdTable';
import Errors from './Errors';

import Lexer from './lexer';

const defaultProgram = `
program sum100 {
	i := 0;
	sum := 0;
	while i < 100.999 do {
		sum := sum + i;
		i := i + 1;
	};
	write(sum);
}
`;

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
					<textarea className="text-editor small-3 large-3 columns" onKeyUp={this.onKeyUp.bind(this)}>{this.state.program}</textarea>
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
