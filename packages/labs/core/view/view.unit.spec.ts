/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

import {render} from '../change-detection/render';
import {viewCreateComponent} from './create-directive';
import {createView} from './create-view';

describe('view', () => {
  @Component({
    selector: `greeter`,
    template: `Hello {{name}}`,
  })
  class MyGreeter {
    name: string = 'World';
  }

  describe('use case', () => {
    it('should support simple bootstrap', () => {
      // This code is an example of how the bootstrap and loading components dynamically are
      // unified. The goal is that if you know how to bootstrap an application than you know how
      // to lazy load components/directives into existing application.

      // First get a hold of an element which you would like to bootstrap too.
      const myAppElement = document.querySelector('my-app')!;

      // Because the element does not have a view, create one.
      const hostView = createView(myAppElement);

      // Instantiate a component into the host view at location of the host element.
      const myApp = viewCreateComponent(hostView, myAppElement, MyGreeter);

      // Render the application.
      render(myApp);
    });

    it('should support creating view with many elements');
    it('should support lazy loading components or directives');
  });
});