import React from 'react';
import App from '../App';
import * as ReactDOM from 'react-dom';

test('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
