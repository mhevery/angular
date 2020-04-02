/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {ComponentInstance, ComponentType, DirectiveType} from './type';

describe('type', () => {
  @Component({
    selector: `greeter`,
    template: `Hello {{name}}`,
  })
  class MyGreeter {
    name: string = 'World';
  }

  @Directive({
    selector: `[my-dir]`,
  })
  class MyDirective {
    name: string = 'World';
  }

  describe('use case', () => {
    it('should support type assignment', () => {
      let componentType: ComponentType<MyGreeter> = MyGreeter;
      expect(componentType).toBe(MyGreeter);

      let directiveType: DirectiveType<MyGreeter> = MyDirective;
      expect(directiveType).toBe(MyGreeter);
    });

    it('should support instance assignment', () => {
      let myGreeter: ComponentInstance<MyGreeter> = new MyGreeter();
      expect(myGreeter instanceof MyGreeter).toBeTruthy();

      let myDir: ComponentInstance<MyDirective> = new MyDirective();
      expect(myDir.name).toEqual('World');
      expect(myDir instanceof MyDirective).toBeTruthy();
    });
  });
});