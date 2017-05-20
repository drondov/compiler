import React from 'react';

export default class LabelTable extends React.Component {
  render() {
    const labels = this.props.labels;
    const children = [];
    children.push(<tr>
      <th>ID</th>
      <th>Token #</th>
    </tr>);
    for (const id in labels) {
      children.push(<tr>
        <td>{id}</td>
        <td>{labels[id]}</td>
      </tr>);
    }
    return <table className="label-table">
      <tbody children={children}></tbody>
    </table>
  }
}
