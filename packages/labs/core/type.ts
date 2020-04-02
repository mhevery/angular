/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

/**
 * A type which represents a type decorated with `@Directive`
 *
 * `Type<T>` is a generic type used in Angular which could represent any type in the system.
 * `DirectiveType<T>` is a more constrained version of `Type<T>` which specifically refers to a
 * `Type<T>` which was decorated with `@Directive`.
 *
 * The type is used in Angular APIs to make it clearer what is the expect type for a particular
 * paramter.
 *
 * ```
 * @Directive({
 *   selector: `[my-dir]`
 * })
 * class MyDirective {}
 *
 * const type: DirectiveType<T> = MyDirective;
 * ```
 *
 * NOTE: `DirectiveType` and `Type<T>` do not provide additional type safety due to
 * https://github.com/Microsoft/TypeScript/issues/4881 its use is meant mainly to serve as better
 * documentation.
 */
export interface DirectiveType<T> extends Type<T> {
  // Ideally we would like say that `DirectiveType` has `ɵdir` which would make it more type safe.
  // Unfortunately due to https://github.com/Microsoft/TypeScript/issues/4881 doing so would create
  // a lot of type errors as `@Directive` currently does not change the type of directive which it
  // is decorating to add `ɵdir`. The down side of this is that `DirectiveType<T>` is just an alias
  // for `Type<T>` without additional type constraints. It is useful for documentation purposes as
  // it make it more clear the intent of the API (even if it does not add any static type checking
  // capabilities)
  // ɵdir: never;
}

/**
 * A type which represents a type decorated with `@Component`
 *
 * `Type<T>` is a generic type used in Angular which could represent any type in the system.
 * `ComponentType<T>` is a more constrained version of `Type<T>` which specifically refers to a
 * `Type<T>` which was decorated with `@Component`.
 *
 * The type is used in Angular APIs to make it clearer what is the expect type for a particular
 * paramter.
 *
 * ```
 * @Component({
 *   selector: `my-comp`,
 *   template: `...`
 * })
 * class MyComponent {}
 *
 * const type: ComponentType<T> = MyComponent;
 * ```
 *
 * NOTE: `ComponentType` and `Type<T>` do not provide additional type safety due to
 * https://github.com/Microsoft/TypeScript/issues/4881 its use is meant mainly to serve as better
 * documentation.
 */
export interface ComponentType<T> extends DirectiveType<T> {
  // Ideally we would like say that `ComponentType` has `ɵcomp` which would make it more type safe.
  // Unfortunately due to https://github.com/Microsoft/TypeScript/issues/4881 doing so would create
  // a lot of type errors as `@Directive` currently does not change the type of directive which it
  // is decorating to add `ɵcomp`. The down side of this is that `ComponentType<T>` is just an alias
  // for `Type<T>` without additional type constraints. It is useful for documentation purposes as
  // it make it more clear the intent of the API (even if it does not add any static type checking
  // capabilities)
  // ɵcomp: never;
}


/**
 * Represents an instance of `Directive`.
 *
 * `DirectiveInstance<T>` is a more constrained version of `Object` which specifically refers to an
 * instance of `DirectiveType<T>` which was decorated with `@Directive`.
 *
 * The type is used in Angular APIs to make it clearer what is the expect type for a particular
 * paramter.
 *
 * ```
 * @Directive({
 *   selector: `[my-dir]`
 * })
 * class MyDirective {}
 *
 * const type: DirectiveInstance<T> = new MyDirective();
 * ```
 */
export type DirectiveInstance<T extends Object> = T;

/**
 * Represents an instance of `Component`.
 *
 * `ComponentInstance<T>` is a more constrained version of `Object` which specifically refers to an
 * instance of `ComponentType<T>` which was decorated with `@Component`.
 *
 * The type is used in Angular APIs to make it clearer what is the expect type for a particular
 * paramter.
 *
 * ```
 * @Component({
 *   selector: `[my-dir]`,
 *   template: `...`
 * })
 * class MyComponent {}
 *
 * const type: ComponentInstance<T> = new MyComponent();
 * ```
 */
export type ComponentInstance<T extends Object> = T;
