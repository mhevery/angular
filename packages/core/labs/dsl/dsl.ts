/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform, Type} from '@angular/core';

// Is this stubbing the internal encoding you were talking about?
export interface ElementDecorator<T> { __brand__: 'ElementModifier'; }

export interface ContextFn<T> { (context: T): any; }

export interface ChildrenDSL { (): void; }

export interface ElementDSL<T> {
  (name: string, ...modifiers: (ElementDecorator<T>|ChildrenDSL)[]): void;
}

export interface AttributeDSL<T> {
  (name: string, value: string): ElementDecorator<T>;
  (name1: string, value1: string,  //
   name2: string, value2: string,  //
   ): ElementDecorator<T>;
}

export interface BindDSL<T> { (name: string, fn: ContextFn<T>): ElementDecorator<T>; }

export interface TextDSL<T> {
  (text: string): void;
  (fn: ContextFn<T>): void;
}

export interface PipeDSL<T> {
  <P extends PipeTransform>(type: Type<P>):
      (...args: Parameters<P['transform']>) => ReturnType<P['transform']>;
}

export interface InterpolateDSL<T> { (...parts: (string|ContextFn<T>)[]): ContextFn<T>; }

// If we're using DirectiveDSL to call components, how do we set the injector?
// Eg I have a stepper form that needs to provide the step-level FormGroupDirective
// to the form element components to get correct continue button behavior.
export interface DirectiveDSL<T> { (directiveType: Type<any>): ElementDecorator<T>; }

export interface ComponentDSL<T> {
  element: ElementDSL<T>;
  text: TextDSL<T>;

  attr: AttributeDSL<T>;
  bind: BindDSL<T>;

  interpolate: InterpolateDSL<T>;
  pipe: PipeDSL<T>;

  directive: DirectiveDSL<T>;
}

// How do we call this componentType from a template? Do class properties become @Inputs?
export function defineComponent<T>(
    componentType: Type<T>, declaration: (dsl: ComponentDSL<T>) => void): void {}
