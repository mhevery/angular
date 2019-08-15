/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';


{
  describe('cookies', () => {
    if (isNode) return;
    it('sets cookie values', () => {
      getDOM().setCookie('my test cookie', 'my test value');
      getDOM().setCookie('my other cookie', 'my test value 2');
      expect(getDOM().getCookie('my test cookie')).toBe('my test value');
    });
  });
}
