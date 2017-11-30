/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { document, containerEl, requestAnimationFrame } from './render_util';
import { renderComponent, defineComponent, T, t, b, markDirty } from '../../src/render3/index';

describe('component', () => {
  class CounterComponent {
    count = 0;

    increment() {
      this.count++;
    }

    static ngComponentDef = defineComponent({
      type: CounterComponent,
      tag: 'counter',
      template: function(ctx: CounterComponent, cm: boolean) {
        if (cm) {
          T(0);
        }
        t(0, b(ctx.count));
      },
      factory: () => new CounterComponent,
      inputs: { count: 'count' },
      methods: { increment: 'increment' }
    });
  }

  beforeEach(() => {

  });

  describe('renderComponent', () => {
    it('should render on initial call', () => {
      renderComponent(CounterComponent, {
        renderer: document,
        host: containerEl,
      });
      expect(containerEl.innerHTML).toEqual('0');
    });

    it('should re-render on input change or method invocation', () => {
      const component = renderComponent(CounterComponent, {
        renderer: document,
        host: containerEl
      });
      expect(containerEl.innerHTML).toEqual('0');
      component.count = 123;
      markDirty(component, requestAnimationFrame);
      expect(containerEl.innerHTML).toEqual('0');
      requestAnimationFrame.flush();
      expect(containerEl.innerHTML).toEqual('123');
      component.increment();
      markDirty(component, requestAnimationFrame);
      expect(containerEl.innerHTML).toEqual('123');
      requestAnimationFrame.flush();
      expect(containerEl.innerHTML).toEqual('124');
    });

  });

});
