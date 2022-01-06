import React from 'react';
import { DataList } from '../components/DataList';
import * as ReactDOM from 'react-dom';

test('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DataList data={[]} />, div);
});
