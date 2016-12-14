import React from 'react';

export default class Errors extends React.Component {
  render() {
    const error = this.props.error;

    return <div className="errors-message">
      {error}
    </div>
  }
}
