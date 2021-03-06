import 'core-js/stable';
import '../style/index.less';
import '../stories/index.less';
import React, { StrictMode } from 'react';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
import { addDecorator } from '@storybook/react';

if (typeof ResizeObserver === 'undefined') {
  window.ResizeObserver = Polyfill;
}

addDecorator(render => (
  <StrictMode>
    {render()}
  </StrictMode>
));
