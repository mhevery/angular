/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {concatStringsWithSpace} from '../../util/stringify';
import {assertFirstCreatePass} from '../assert';
import {AttributeMarker, TAttributes, TNode} from '../interfaces/node';
import {getTView} from '../state';

/**
 * Compute the static styling (class/style) from `TAttributes`.
 *
 * This function should be called during `firstCreatePass` only.
 *
 * @param tNode The `TNode` into which the styling information should be loaded.
 * @param attrs `TAttributes` containing the styling information.
 * @param noHost Where should the resulting static styles be written?
 *   - `true` Write to `TNode.stylesNoHost` / `TNode.classesNoHost`
 *   - `false` Write to `TNode.styles` / `TNode.classes`
 */
export function computeStaticStyling(tNode: TNode, attrs: TAttributes|null, noHost: boolean): void {
  ngDevMode &&
      assertFirstCreatePass(getTView(), 'Expecting to be called in first template pass only');
  let styles: string|null = noHost ? null : tNode.styles;
  let classes: string|null = noHost ? null : tNode.classes;
  let mode: AttributeMarker|0 = 0;
  for (let i = 0; attrs !== null && i < attrs.length; i++) {
    const value = attrs[i];
    if (typeof value === 'number') {
      mode = value;
    } else if (mode == AttributeMarker.Classes) {
      classes = concatStringsWithSpace(classes, value as string);
    } else if (mode == AttributeMarker.Styles) {
      const style = value as string;
      const styleValue = attrs[++i] as string;
      styles = concatStringsWithSpace(styles, style + ': ' + styleValue + ';');
    }
  }
  noHost ? tNode.stylesNoHost = styles : tNode.styles = styles;
  noHost ? tNode.classesNoHost = classes : tNode.classes = classes;
}