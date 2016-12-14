import React from 'react';

export default class Lexems extends React.Component {
	render() {
		const tokens = this.props.tokens;
		const children = [];
		children.push(<tr>
			<th>Text</th>
			<th>Type</th>
			<th>Code</th>
			<th>Const ref</th>
			<th>ID ref</th>
		</tr>);
		for (let i = 0; i < tokens.length; ++i) {
			children.push(<tr>
				<td>{tokens[i].text}</td>
				<td>{tokens[i].lexem.type}</td>
				<td>{tokens[i].lexem.code}</td>
				<td>{tokens[i].constantRef}</td>
				<td>{tokens[i].idRef}</td>
			</tr>);
		}
		return <table className="lexems">
			<tbody children={children}></tbody>
		</table>;
	}
}
