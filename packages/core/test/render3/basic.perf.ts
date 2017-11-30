/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createWindow} from 'domino';
import {renderComponent, defineComponent, E, e, T, C, c, V, v, rC, rc} from '../../src/render3/index';

describe('iv perf test', () => {

  var window = createWindow('', 'http://localhost');
  var document = window.document;
  const count = 100000;
  const noOfIterations = 10;

  describe('render', () => {
    for(var iteration = 0; iteration < noOfIterations; iteration++) {
      it(`${iteration}. create ${count} divs in DOM`, () => {
        const start = new Date().getTime();
        const container = document.createElement('div');
        for(var i = 0; i < count; i++ ) {
          const div = document.createElement('div');
          div.appendChild(document.createTextNode('-'));
          container.appendChild(div);
        }
        const end = new Date().getTime();
        log(`${count} DIVs in DOM`, (end - start)/count);
      });

      it(`${iteration}. create ${count} divs in Render3`, () => {
        class Component {
          static ngComponentDef = defineComponent({
            type: Component,
            tag: 'div',
            template: function Template(ctx: any, cm: any) {
              if (cm) {
                C(0);c();
              }
              rC(0); {
                for(var i = 0; i < count; i++ ) {
                  let cm0 = V(0); {
                    if (cm0) {
                      E(0, 'div');
                        T(1, '-');
                      e();
                    }
                  } v();
                }
              } rc();
            },
            factory: () => new Component
          });
        }

        const start = new Date().getTime();
        renderComponent(Component, {renderer: document});
        const end = new Date().getTime();
        log(`${count} DIVs in Render3`, (end - start)/count);
      });
      }
  });
});

function log(text: string, duration: number) {
  console.log(text, duration * 1000, 'ns');
}
