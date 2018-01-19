/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ɵdefineComponent as defineComponent, ɵt as t, ɵb1 as b1, ɵT as T } from "@angular/core";

class HelloWold {
  name = 'World';

  static ngComponentDef = defineComponent({
    tag: 'hell-world',
    factory: () => new HelloWold(),
    template: function HelloWoldTemplate(ctx: HelloWold, cm: boolean) {
      if (cm) {
        T(0);
      }
      t(0, b1('Hello ', ctx.name, '!'));
    }
  });
}


