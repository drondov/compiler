import React from 'react';

export default class ConstantTable extends React.Component {
  render() {
    const ids = this.props.ids;
    const children = [];
    children.push(<tr>
      <th>ID</th>
    </tr>);
    for (let i = 0; i < ids.length; ++i) {
      children.push(<tr>
        <td>{ids[i].value}</td>
      </tr>);
    }
    return <table class="ids-table">
      <tbody children={children}></tbody>
    </table>
  }
}
