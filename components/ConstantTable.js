import React from 'react';

export default class ConstantTable extends React.Component {
  render() {
    const constants = this.props.constants;
    const children = [];
    children.push(<tr>
      <th>Value</th>
      <th>Type</th>
      <th>Code</th>
    </tr>);
    for (let i = 0; i < constants.length; ++i) {
      children.push(<tr>
        <td>{constants[i].value}</td>
        <td>{constants[i].type}</td>
        <td>{i}</td>
      </tr>);
    }
    return <table className="constant-table">
      <tbody children={children}></tbody>
    </table>
  }
}
