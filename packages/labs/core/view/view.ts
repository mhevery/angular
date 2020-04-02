/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * An opaque type representing an Angular view.
 *
 * A `View` represents a building block for building Angular UIs. A `View` is smallest structurally
 * stable piece of DOM. Structurally stable means that he elements which are part of the view are
 * always created and destroyed together. View's often have bindings which allow the View to
 * update the properties, attributes and styling on the DOM elements which are part of the view.
 * Views can have other views attached to them forming a tree.
 *
 * ```
 * @Component({
 *   selector: 'my-comp',
 *   template: `
 *       <child></child>
 *       <ul>
 *          <li *ngFor="item in items">{{item}}</li>
 *       <ul>`
 * })
 * class MyComponent {
 *   items = ['A', 'B'];
 * }
 * ```
 *
 * In the above example a possible view tree would like like so:
 * ```
 *  <#VIEW for="MyComponent" id="myCompView">
 *    <child>
 *       <#VIEW for="Child" id="childView">...<#VIEW>
 *    </child>
 *    <ul>
 *       <#VIEW-CONTAINER id="myContainer">
 *          <#VIEW id="li1View"><li>A</li><#VIEW>
 *          <#VIEW id="li2View"><li>B</li><#VIEW>
 *       <#VIEW-CONTAINER>
 *    </ul>
 *  <#VIEW>
 * ```
 *
 * Notice that there are multiple `View`s:
 * - `myCompView`: A `View` which represents the root of the `MyComponent`.
 * - `childView`: A child view of `myCompView` which is attached to the `<child>` and represents the
 *   `Child`'s view.
 * - `li1View`/`lib2View`: views which represent the unrolling of `*ngFor`.
 * - Child views can be attached:
 *   - directly (and permanently) to a parent view (as in case of `childView`)
 *   - or dynamically through `ViewContainer` (as in the case of `lib1View`/`lib2View` attached as a
 *     child of `myContainer`)
 *
 * The resulting view tree will look like this:
 * ```
 *             VIEW[myCompView]
 *              /           \
 *  VIEW[childView]       VIEW_CONTAINER[myContainer]
 *                            /              \
 *                     VIEW[li1View]      VIEW[li2View]
 * ```
 *
 * A `View` is an opaque type (meaning there are no public properties or methods declared on it. Do
 * not access anything on the `View` as these are not part of public API and can change at any
 * time.) It represents a reference to a view concept and can be used when interacting with other
 * Angular APIs.
 */
export interface View<T> {
  __ng_brand__: 'View';
}
