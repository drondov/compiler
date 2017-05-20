import React from 'react';

export default class RPNBuilderTable extends React.Component {
  render() {
    const steps = this.props.steps;
    const children = [];
    children.push(<tr>
      <th>No</th>
      <th>Token</th>
      <th>Stack</th>
      <th>RPN</th>
    </tr>);
    for (let i = 0; i < steps.length; ++i) {
      children.push(<tr>
        <td>{i}</td>
        <td>{_.get(steps[i], 'token.text')}</td>
        <td>{steps[i].stack.map(x => x.text).join(', ')}</td>
        <td>{steps[i].rpn.map(x => x.text).join(' ')}</td>
      </tr>);
    }
    return <table className="rpn-table-table">
        {/*{JSON.stringify(steps)}*/}
      <tbody children={children}></tbody>
    </table>
  }
}
