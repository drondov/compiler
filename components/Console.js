import _ from 'lodash';
import React from 'react';
import If from 'react-if';

import RPNGenerator from '../rpn-generator';
import RPNExecuter from '../rpn-executer';

export default class Console extends React.Component {

	constructor(props) {
		super(props);

		this.onRun = this.onRun.bind(this);
		this.onContinue = this.onContinue.bind(this);

		this.state = {
			logs: [],
			lexerData: props.lexerData,
			pause: false,
		};
	}

	run() {
		const rpnGenerator = new RPNGenerator();
		const rpn = rpnGenerator.generate(this.state.lexerData);
		console.log('rpn', rpn);
		console.log('rpn', rpn.map(token => token.text).join(' '));
        const executer = new RPNExecuter({
            tokens: rpn,
        });
		executer.execute();
		this.setState({
			executer,
			logs: executer.logs,
			pause: executer.pause,
		});
	}

	onContinue() {
		const value = parseFloat(document.querySelector('.console-read').value);
		if (_.isNaN(value)) {
			alert('Value is invalid');
			return;
		}
		try {
			this.state.executer.continue(value);
			this.setState(state => {
				return {
					pause: state.executer.pause,
					logs: state.executer.logs,
				};
			});
		} catch (e) {
			this.setState(state => {
				return {
					pause: false,
					logs: [...state.executer.logs, `RUNTIME ERROR: ${e.message}`],
				};
			});
		}
	}

	onRun() {
		const lexerData = this.props.lexerData;
		if (lexerData.error) {
			this.setState({
				pause: false,
				executer: null,
				lexerData,
			});
			return;
		}
		this.setState({
			lexerData,
		}, () => this.run());
	}

	render() {
		const $logs = _.map(this.state.logs, log => {
			return <div className="console-log">
				{log}
			</div>;
		});
		return <div className="console">
			<div style={{padding: 10}}>
				{$logs}
			</div>
			<If condition={this.state.pause}>
				<div className="console-input">
					<input className="console-read" />
					<button className="button primary" onClick={this.onContinue}>Continue</button>
				</div>
			</If>
			<button 
				className="button primary" 
				onClick={this.onRun}
				disabled={!!this.props.lexerData.error}
				>Run program</button>
		</div>
	}
}