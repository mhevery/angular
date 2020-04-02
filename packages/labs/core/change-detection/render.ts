/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentInstance} from '../type';
import {View} from '../view/view';

/**
 * Render a component (or view) into the DOM.
 *
 * Rendering involves executing change detection on the current `View` (and child `View`s.) If any
 * changes are detected than they are reflected in the DOM or in the component/directive instances.
 * Any lifecycle hooks are executed as well.
 *
 * @param componentOrView The `ComponentInstance` or the associated `View` for the
 * `ComponentInstance` where the change detection should be initiated from.
 */
export function render(componentOrView: ComponentInstance<any>|View<any>): void {}