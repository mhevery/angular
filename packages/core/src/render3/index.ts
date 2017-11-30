/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export { injectElementRef, injectTemplateRef, injectViewContainerRef, inject } from './di';
export {
  ComponentDef, DirectiveDef, ComponentTemplate, defineDirective, defineComponent,
  DirectiveDefFlags, NgOnChangesFeature, PublicFeature, ComponentType
} from './public_interfaces';
export { createComponentRef, renderComponent, markDirty, detectChanges, getHostElement } from './component';
export { QueryList } from './query';
export { mergeInputsAndOutputs } from './instructions';

// Naming scheme:
// - Capital letters are for crating things: T(Text), E(Element), D(Directive), V(View), C(Container), L(Listener)
// - lower case letters are for binding: b(bind)
// - lower case letters are for binding target: p(property), a(attribute), k(class), s(style), i(input)
// - lower case letters for guarding life cycle hooks: l(lifeCycle)
// - lower case for closing: c(containerEnd), e(elementEnd), v(viewEnd)
export {
  textCreate as T,
  textCreateBound as t,

  elementCreate as E,
  elementProperty as p,
  elementAttribute as a,
  elementClass as k,
  elementStyle as s,
  elementEnd as e,

  listenerCreate as L,

  bind as b,
  bind1 as b1,
  bind2 as b2,
  bind3 as b3,
  bind4 as b4,
  bind5 as b5,
  bind6 as b6,
  bind7 as b7,
  bind8 as b8,
  bindV as bV,
  NO_CHANGE as NC,

  containerCreate as C,
  containerEnd as c,

  viewCreate as V,
  viewEnd as v,

  refreshComponent as r,
  refreshContainer as rC,
  refreshContainerEnd as rc,

  directiveCreate as D,
  directiveInput as i,
  directiveLifeCycle as l,

  contentProjection as P,

  memory as m,

  queryCreate as Q,
  refreshQuery as rQ,

  LifeCycleGuard
} from './instructions';
