/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentType, DirectiveType} from '../type';
import {View} from './view';

/**
 * Instantiate a directive in a `View`.
 *
 * Dynamically instantiate a directive in a `View` at a location of `element`. This is a one time
 * instantiation. Feature instances of the `View` will not have the directive atomically included.
 *
 * @param view The `View` where the directive instance will be inserted.
 * @param element The `Element` at which the directive is inserted.
 * @param directiveType The `DirectiveType` to instantiate.
 */
export function viewCreateDirective<T>(
    view: View<any>, element: Element, directiveType: DirectiveType<T>): T {
  return null!;
}

/**
 * Instantiate a component in a `View`.
 *
 * Dynamically instantiate a component in a `View` at a location of `element`. This is a one time
 * instantiation. Feature instances of the `View` will not have the component atomically included.
 *
 * @param view The `View` where the component instance will be inserted.
 * @param element The `Element` at which the component is inserted.
 * @param componentType The `ComponentType` to instantiate.
 */
export function viewCreateComponent<T>(
    view: View<any>, element: Element, componentType: ComponentType<T>): T {
  return null!;
}