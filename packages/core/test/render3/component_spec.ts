/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ElementRef, Injectable, InjectionToken, ViewEncapsulation, createInjector, defineInjectable, defineInjector, inject} from '../../src/core';
import {forwardRef} from '../../src/di/forward_ref';
import {injectInjectorOnly, setInjectImplementation} from '../../src/di/injector';
import {getRenderedText} from '../../src/render3/component';

import {AttributeMarker, ComponentFactory, LifecycleHooksFeature, defineComponent, defineDirective, directiveInject, markDirty, template, ProvidersFeature} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, nextContext, text, textBinding, tick, projectionDef, projection} from '../../src/render3/instructions';
import {ComponentDefInternal, RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture, containerEl, createComponent, renderComponent, renderToHtml, requestAnimationFrame, toHtml} from './render_util';

describe('component', () => {
  class CounterComponent {
    count = 0;

    increment() { this.count++; }

    static ngComponentDef = defineComponent({
      type: CounterComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['counter']],
      consts: 1,
      vars: 1,
      template: function(rf: RenderFlags, ctx: CounterComponent) {
        if (rf & RenderFlags.Create) {
          text(0);
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, bind(ctx.count));
        }
      },
      factory: () => new CounterComponent,
      inputs: {count: 'count'},
    });
  }

  describe('renderComponent', () => {
    it('should render on initial call', () => {
      renderComponent(CounterComponent);
      expect(toHtml(containerEl)).toEqual('0');
    });

    it('should re-render on input change or method invocation', () => {
      const component = renderComponent(CounterComponent);
      expect(toHtml(containerEl)).toEqual('0');
      component.count = 123;
      markDirty(component);
      expect(toHtml(containerEl)).toEqual('0');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('123');
      component.increment();
      markDirty(component);
      expect(toHtml(containerEl)).toEqual('123');
      requestAnimationFrame.flush();
      expect(toHtml(containerEl)).toEqual('124');
    });

    class MyService {
      constructor(public value: string) {}
      static ngInjectableDef =
          defineInjectable({providedIn: 'root', factory: () => new MyService('no-injector')});
    }
    class MyComponent {
      constructor(public myService: MyService) {}
      static ngComponentDef = defineComponent({
        type: MyComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['my-component']],
        factory: () => new MyComponent(directiveInject(MyService)),
        consts: 1,
        vars: 1,
        template: function(fs: RenderFlags, ctx: MyComponent) {
          if (fs & RenderFlags.Create) {
            text(0);
          }
          if (fs & RenderFlags.Update) {
            textBinding(0, bind(ctx.myService.value));
          }
        }
      });
    }

    class MyModule {
      static ngInjectorDef = defineInjector({
        factory: () => new MyModule(),
        providers: [{provide: MyService, useValue: new MyService('injector')}]
      });
    }

    it('should support bootstrapping without injector', () => {
      const fixture = new ComponentFixture(MyComponent);
      expect(fixture.html).toEqual('no-injector');
    });

    it('should support bootstrapping with injector', () => {
      const fixture = new ComponentFixture(MyComponent, {injector: createInjector(MyModule)});
      expect(fixture.html).toEqual('injector');
    });

  });

});

describe('component with a container', () => {

  function showItems(rf: RenderFlags, ctx: {items: string[]}) {
    if (rf & RenderFlags.Create) {
      container(0);
    }
    if (rf & RenderFlags.Update) {
      containerRefreshStart(0);
      {
        for (const item of ctx.items) {
          const rf0 = embeddedViewStart(0, 1, 1);
          {
            if (rf0 & RenderFlags.Create) {
              text(0);
            }
            if (rf0 & RenderFlags.Update) {
              textBinding(0, bind(item));
            }
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }
  }

  class WrapperComponent {
    // TODO(issue/24571): remove '!'.
    items !: string[];
    static ngComponentDef = defineComponent({
      type: WrapperComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['wrapper']],
      consts: 1,
      vars: 0,
      template: function ChildComponentTemplate(rf: RenderFlags, ctx: {items: string[]}) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            const rf0 = embeddedViewStart(0, 1, 0);
            { showItems(rf0, {items: ctx.items}); }
            embeddedViewEnd();
          }
          containerRefreshEnd();
        }
      },
      factory: () => new WrapperComponent,
      inputs: {items: 'items'}
    });
  }

  function template(rf: RenderFlags, ctx: {items: string[]}) {
    if (rf & RenderFlags.Create) {
      element(0, 'wrapper');
    }
    if (rf & RenderFlags.Update) {
      elementProperty(0, 'items', bind(ctx.items));
    }
  }

  const defs = [WrapperComponent];

  it('should re-render on input change', () => {
    const ctx: {items: string[]} = {items: ['a']};
    expect(renderToHtml(template, ctx, 1, 1, defs)).toEqual('<wrapper>a</wrapper>');

    ctx.items = [...ctx.items, 'b'];
    expect(renderToHtml(template, ctx, 1, 1, defs)).toEqual('<wrapper>ab</wrapper>');
  });

});

// TODO: add tests with Native once tests are run in real browser (domino doesn't support shadow
// root)
describe('encapsulation', () => {
  class WrapperComponent {
    static ngComponentDef = defineComponent({
      type: WrapperComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['wrapper']],
      consts: 1,
      vars: 0,
      template: function(rf: RenderFlags, ctx: WrapperComponent) {
        if (rf & RenderFlags.Create) {
          element(0, 'encapsulated');
        }
      },
      factory: () => new WrapperComponent,
      directives: () => [EncapsulatedComponent]
    });
  }

  class EncapsulatedComponent {
    static ngComponentDef = defineComponent({
      type: EncapsulatedComponent,
      selectors: [['encapsulated']],
      consts: 2,
      vars: 0,
      template: function(rf: RenderFlags, ctx: EncapsulatedComponent) {
        if (rf & RenderFlags.Create) {
          text(0, 'foo');
          element(1, 'leaf');
        }
      },
      factory: () => new EncapsulatedComponent,
      encapsulation: ViewEncapsulation.Emulated,
      styles: [],
      data: {},
      directives: () => [LeafComponent]
    });
  }

  class LeafComponent {
    static ngComponentDef = defineComponent({
      type: LeafComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['leaf']],
      consts: 2,
      vars: 0,
      template: function(rf: RenderFlags, ctx: LeafComponent) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { text(1, 'bar'); }
          elementEnd();
        }
      },
      factory: () => new LeafComponent,
    });
  }

  it('should encapsulate children, but not host nor grand children', () => {
    renderComponent(WrapperComponent, {rendererFactory: getRendererFactory2(document)});
    expect(containerEl.outerHTML)
        .toMatch(
            /<div host=""><encapsulated _nghost-c(\d+)="">foo<leaf _ngcontent-c\1=""><span>bar<\/span><\/leaf><\/encapsulated><\/div>/);
  });

  it('should encapsulate host', () => {
    renderComponent(EncapsulatedComponent, {rendererFactory: getRendererFactory2(document)});
    expect(containerEl.outerHTML)
        .toMatch(
            /<div host="" _nghost-c(\d+)="">foo<leaf _ngcontent-c\1=""><span>bar<\/span><\/leaf><\/div>/);
  });

  it('should encapsulate host and children with different attributes', () => {
    class WrapperComponentWith {
      static ngComponentDef = defineComponent({
        type: WrapperComponentWith,
        selectors: [['wrapper']],
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: WrapperComponentWith) {
          if (rf & RenderFlags.Create) {
            element(0, 'leaf');
          }
        },
        factory: () => new WrapperComponentWith,
        encapsulation: ViewEncapsulation.Emulated,
        styles: [],
        data: {},
        directives: () => [LeafComponentwith]
      });
    }

    class LeafComponentwith {
      static ngComponentDef = defineComponent({
        type: LeafComponentwith,
        selectors: [['leaf']],
        consts: 2,
        vars: 0,
        template: function(rf: RenderFlags, ctx: LeafComponentwith) {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'span');
            { text(1, 'bar'); }
            elementEnd();
          }
        },
        factory: () => new LeafComponentwith,
        encapsulation: ViewEncapsulation.Emulated,
        styles: [],
        data: {},
      });
    }

    renderComponent(WrapperComponentWith, {rendererFactory: getRendererFactory2(document)});
    expect(containerEl.outerHTML)
        .toMatch(
            /<div host="" _nghost-c(\d+)=""><leaf _ngcontent-c\1="" _nghost-c(\d+)=""><span _ngcontent-c\2="">bar<\/span><\/leaf><\/div>/);
  });

});

describe('recursive components', () => {
  let events: string[];
  let count: number;

  beforeEach(() => {
    events = [];
    count = 0;
  });

  class TreeNode {
    constructor(
        public value: number, public depth: number, public left: TreeNode|null,
        public right: TreeNode|null) {}
  }

  /**
   * {{ data.value }}
   *
   * % if (data.left != null) {
   *   <tree-comp [data]="data.left"></tree-comp>
   * % }
   * % if (data.right != null) {
   *   <tree-comp [data]="data.right"></tree-comp>
   * % }
   */
  class TreeComponent {
    data: TreeNode = _buildTree(0);

    ngDoCheck() { events.push('check' + this.data.value); }

    ngOnDestroy() { events.push('destroy' + this.data.value); }

    static ngComponentDef = defineComponent({
      type: TreeComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['tree-comp']],
      factory: () => new TreeComponent(),
      consts: 3,
      vars: 1,
      template: (rf: RenderFlags, ctx: TreeComponent) => {
        if (rf & RenderFlags.Create) {
          text(0);
          container(1);
          container(2);
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, bind(ctx.data.value));
          containerRefreshStart(1);
          {
            if (ctx.data.left != null) {
              let rf0 = embeddedViewStart(0, 1, 1);
              if (rf0 & RenderFlags.Create) {
                element(0, 'tree-comp');
              }
              if (rf0 & RenderFlags.Update) {
                elementProperty(0, 'data', bind(ctx.data.left));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
          containerRefreshStart(2);
          {
            if (ctx.data.right != null) {
              let rf0 = embeddedViewStart(0, 1, 1);
              if (rf0 & RenderFlags.Create) {
                element(0, 'tree-comp');
              }
              if (rf0 & RenderFlags.Update) {
                elementProperty(0, 'data', bind(ctx.data.right));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      },
      inputs: {data: 'data'}
    });
  }

  (TreeComponent.ngComponentDef as ComponentDefInternal<TreeComponent>).directiveDefs =
      () => [TreeComponent.ngComponentDef];

  /**
   * {{ data.value }}
   *  <ng-if-tree [data]="data.left" *ngIf="data.left"></ng-if-tree>
   *  <ng-if-tree [data]="data.right" *ngIf="data.right"></ng-if-tree>
   */
  class NgIfTree {
    data: TreeNode = _buildTree(0);

    ngOnDestroy() { events.push('destroy' + this.data.value); }

    static ngComponentDef = defineComponent({
      type: NgIfTree,
      encapsulation: ViewEncapsulation.None,
      selectors: [['ng-if-tree']],
      factory: () => new NgIfTree(),
      consts: 3,
      vars: 3,
      template: (rf: RenderFlags, ctx: NgIfTree) => {

        if (rf & RenderFlags.Create) {
          text(0);
          template(1, IfTemplate, 1, 1, '', [AttributeMarker.SelectOnly, 'ngIf']);
          template(2, IfTemplate2, 1, 1, '', [AttributeMarker.SelectOnly, 'ngIf']);
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, bind(ctx.data.value));
          elementProperty(1, 'ngIf', bind(ctx.data.left));
          elementProperty(2, 'ngIf', bind(ctx.data.right));
        }

      },
      inputs: {data: 'data'},
    });
  }

  function IfTemplate(rf: RenderFlags, left: any) {
    if (rf & RenderFlags.Create) {
      elementStart(0, 'ng-if-tree');
      elementEnd();
    }
    if (rf & RenderFlags.Update) {
      const parent = nextContext();
      elementProperty(0, 'data', bind(parent.data.left));
    }
  }

  function IfTemplate2(rf: RenderFlags, right: any) {
    if (rf & RenderFlags.Create) {
      elementStart(0, 'ng-if-tree');
      elementEnd();
    }
    if (rf & RenderFlags.Update) {
      const parent = nextContext();
      elementProperty(0, 'data', bind(parent.data.right));
    }
  }

  (NgIfTree.ngComponentDef as ComponentDefInternal<NgIfTree>).directiveDefs =
      () => [NgIfTree.ngComponentDef, NgIf.ngDirectiveDef];

  function _buildTree(currDepth: number): TreeNode {
    const children = currDepth < 2 ? _buildTree(currDepth + 1) : null;
    const children2 = currDepth < 2 ? _buildTree(currDepth + 1) : null;
    return new TreeNode(count++, currDepth, children, children2);
  }

  it('should check each component just once', () => {
    const comp = renderComponent(TreeComponent, {hostFeatures: [LifecycleHooksFeature]});
    expect(getRenderedText(comp)).toEqual('6201534');
    expect(events).toEqual(['check6', 'check2', 'check0', 'check1', 'check5', 'check3', 'check4']);

    events = [];
    tick(comp);
    expect(events).toEqual(['check6', 'check2', 'check0', 'check1', 'check5', 'check3', 'check4']);
  });

  // This tests that the view tree is set up properly for recursive components
  it('should call onDestroys properly', () => {

    /**
     * % if (!skipContent) {
     *   <tree-comp></tree-comp>
     * % }
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        if (!ctx.skipContent) {
          const rf0 = embeddedViewStart(0, 1, 0);
          if (rf0 & RenderFlags.Create) {
            elementStart(0, 'tree-comp');
            elementEnd();
          }
          embeddedViewEnd();
        }
        containerRefreshEnd();
      }
    }, 1, 0, [TreeComponent]);

    const fixture = new ComponentFixture(App);
    expect(getRenderedText(fixture.component)).toEqual('6201534');

    events = [];
    fixture.component.skipContent = true;
    fixture.update();
    expect(events).toEqual(
        ['destroy0', 'destroy1', 'destroy2', 'destroy3', 'destroy4', 'destroy5', 'destroy6']);
  });

  it('should call onDestroys properly with ngIf', () => {
    /**
     * % if (!skipContent) {
     *   <ng-if-tree></ng-if-tree>
     * % }
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        if (!ctx.skipContent) {
          const rf0 = embeddedViewStart(0, 1, 0);
          if (rf0 & RenderFlags.Create) {
            elementStart(0, 'ng-if-tree');
            elementEnd();
          }
          embeddedViewEnd();
        }
        containerRefreshEnd();
      }
    }, 1, 0, [NgIfTree]);

    const fixture = new ComponentFixture(App);
    expect(getRenderedText(fixture.component)).toEqual('6201534');

    events = [];
    fixture.component.skipContent = true;
    fixture.update();
    expect(events).toEqual(
        ['destroy0', 'destroy1', 'destroy2', 'destroy3', 'destroy4', 'destroy5', 'destroy6']);
  });

  it('should map inputs minified & unminified names', async() => {
    class TestInputsComponent {
      // TODO(issue/24571): remove '!'.
      minifiedName !: string;
      static ngComponentDef = defineComponent({
        type: TestInputsComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['test-inputs']],
        inputs: {minifiedName: 'unminifiedName'},
        consts: 0,
        vars: 0,
        factory: () => new TestInputsComponent(),
        template: function(rf: RenderFlags, ctx: TestInputsComponent): void {
          // Template not needed for this test
        }
      });
    }

    const testInputsComponentFactory = new ComponentFactory(TestInputsComponent.ngComponentDef);

    expect([
      {propName: 'minifiedName', templateName: 'unminifiedName'}
    ]).toEqual(testInputsComponentFactory.inputs);

  });

});

describe('providers', () => {
  // Needed for test which are unit testing `inject`
  afterEach(() => { setInjectImplementation(injectInjectorOnly); });

  abstract class Greeter { abstract greet: string; }

  class GreeterClass implements Greeter {
    greet = 'Hi class';
  }

  class GreeterDeps implements Greeter {
    constructor(public greet: string) {}
  }

  class GreeterBuiltInDeps implements Greeter {
    public greet: string;
    constructor(private message: string, private elementRef: ElementRef) {
      this.greet = this.message + this.elementRef.nativeElement.tagName;
    }
  }

  class GreeterProvider {
    provide() { return 'Coucou'; }
  }

  @Injectable()
  class GreeterInj implements Greeter {
    public greet: string;
    constructor(private provider: GreeterProvider) { this.greet = this.provider.provide(); }

    static ngInjectableDef =
        defineInjectable({factory: () => new GreeterInj(inject(GreeterProvider as any))});
  }

  class MyModule {
    static ngInjectorDef = defineInjector(
        {factory: () => new MyModule(), providers: [{provide: Greeter, useValue: {greet: 'Hi'}}]});
  }

  describe('should support all types of Provider:', () => {
    it('TypeProvider', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [GreeterClass],
      })
      class ComponentWithProviders {
        constructor(private greeter: GreeterClass) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(GreeterClass as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([GreeterClass])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hi class');
    });

    it('ValueProvider', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [{provide: Greeter, useValue: {greet: 'Hallo'}}],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hallo'}}])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hallo');
    });

    it('ClassProvider', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [{provide: Greeter, useClass: GreeterClass}],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([{provide: Greeter, useClass: GreeterClass}])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hi class');
    });

    it('ExistingProvider', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [GreeterClass, {provide: Greeter, useExisting: GreeterClass}],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features:
              [ProvidersFeature([GreeterClass, {provide: Greeter, useExisting: GreeterClass}])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hi class');
    });

    it('FactoryProvider', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [{provide: Greeter, useFactory: () => new GreeterClass()}],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features:
              [ProvidersFeature([{provide: Greeter, useFactory: () => new GreeterClass()}])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hi class');
    });

    const MESSAGE = new InjectionToken<string>('message');

    it('ClassProvider with deps', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [
          {provide: MESSAGE, useValue: 'Cześć'},
          {provide: Greeter, useClass: GreeterDeps, deps: [MESSAGE]}
        ],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([
            {provide: MESSAGE, useValue: 'Cześć'},
            {provide: Greeter, useClass: GreeterDeps, deps: [MESSAGE]}
          ])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Cześć');
    });

    // TODO: enable once built-ins tokens (ElementRef, etc) are refactored to become Injectable
    xit('ClassProvider with built-in deps', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [
          {provide: MESSAGE, useValue: 'Cześć'},
          {provide: Greeter, useClass: GreeterBuiltInDeps, deps: [MESSAGE, ElementRef]}
        ],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([
            {provide: MESSAGE, useValue: 'Cześć'},
            {provide: Greeter, useClass: GreeterBuiltInDeps, deps: [MESSAGE, ElementRef]}
          ])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Cześć');
    });

    it('FactoryProvider with deps', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [
          {provide: MESSAGE, useValue: 'Cześć'},
          {provide: Greeter, useFactory: (msg: string) => new GreeterDeps(msg), deps: [MESSAGE]}
        ],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([
            {provide: MESSAGE, useValue: 'Cześć'}, {
              provide: Greeter,
              useFactory: (msg: string) => new GreeterDeps(msg),
              deps: [MESSAGE]
            }
          ])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Cześć');
    });

    // TODO: enable once built-ins tokens (ElementRef, etc) are refactored to become Injectable
    xit('FactoryProvider with built-in deps', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [
          {provide: MESSAGE, useValue: 'Cześć'}, {
            provide: Greeter,
            useFactory: (msg: string, elementRef: ElementRef) =>
                            new GreeterBuiltInDeps(msg, elementRef),
            deps: [MESSAGE, ElementRef]
          }
        ],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([
            {provide: MESSAGE, useValue: 'Cześć'}, {
              provide: Greeter,
              useFactory: (msg: string, elementRef: ElementRef) =>
                              new GreeterBuiltInDeps(msg, elementRef),
              deps: [MESSAGE, ElementRef]
            }
          ])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Cześć');
    });

    it('ClassProvider with injectable', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [GreeterProvider, {provide: Greeter, useClass: GreeterInj}],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features:
              [ProvidersFeature([GreeterProvider, {provide: Greeter, useClass: GreeterInj}])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Coucou');
    });

    it('array of providers', () => {
      @Component({
        template: '{{greeter.greet()}}',
        providers: [[
          {provide: Greeter, useValue: {greet: 'Ola'}},
          {provide: Greeter, useValue: {greet: 'Hallo'}}
        ]],
      })
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
          features: [ProvidersFeature([[
            {provide: Greeter, useValue: {greet: 'Ola'}},
            {provide: Greeter, useValue: {greet: 'Hallo'}}
          ]])]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hallo');
    });
  });

  describe('and viewProviders', () => {
    describe('without projection', () => {
      it('should work without providers nor viewProviders in component, using module injector as backup',
         () => {
           @Component({template: '{{greeter.greet()}}'})
           class ComponentWithProviders {
             constructor(private greeter: Greeter) {}

             static ngComponentDef = defineComponent({
               type: ComponentWithProviders,
               selectors: [['component-with-providers']],
               factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
               consts: 1,
               vars: 1,
               template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
                 if (fs & RenderFlags.Create) {
                   text(0);
                 }
                 if (fs & RenderFlags.Update) {
                   textBinding(0, bind(ctx.greeter.greet));
                 }
               },
             });
           }

           const fixture =
               new ComponentFixture(ComponentWithProviders, {injector: createInjector(MyModule)});
           expect(fixture.html).toEqual('Hi');
         });

      it('should work with only providers in component', () => {
        @Component({
          template: '{{greeter.greet()}}',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}}],
        })
        class ComponentWithProviders {
          constructor(private greeter: Greeter) {}

          static ngComponentDef = defineComponent({
            type: ComponentWithProviders,
            selectors: [['component-with-providers']],
            factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
            consts: 1,
            vars: 1,
            template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
              if (fs & RenderFlags.Create) {
                text(0);
              }
              if (fs & RenderFlags.Update) {
                textBinding(0, bind(ctx.greeter.greet));
              }
            },
            features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hallo'}}])]
          });
        }

        const fixture =
            new ComponentFixture(ComponentWithProviders, {injector: createInjector(MyModule)});
        expect(fixture.html).toEqual('Hallo');
      });

      it('should work with only viewProviders in component', () => {
        @Component({
          template: '{{greeter.greet()}}',
          viewProviders: [{provide: Greeter, useValue: {greet: 'Hallo'}}],
        })
        class ComponentWithProviders {
          constructor(private greeter: Greeter) {}

          static ngComponentDef = defineComponent({
            type: ComponentWithProviders,
            selectors: [['component-with-providers']],
            factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
            consts: 1,
            vars: 1,
            template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
              if (fs & RenderFlags.Create) {
                text(0);
              }
              if (fs & RenderFlags.Update) {
                textBinding(0, bind(ctx.greeter.greet));
              }
            },
            features: [ProvidersFeature([], [{provide: Greeter, useValue: {greet: 'Hallo'}}])]
          });
        }

        const fixture =
            new ComponentFixture(ComponentWithProviders, {injector: createInjector(MyModule)});
        expect(fixture.html).toEqual('Hallo');
      });

      it('should work with both providers and viewProviders in component, using viewProviders',
         () => {
           @Component({
             template: '{{greeter.greet()}}',
             providers: [{provide: Greeter, useValue: {greet: 'Hallo'}}],
             viewProviders: [{provide: Greeter, useValue: {greet: 'Bonjour'}}],
           })
           class ComponentWithProviders {
             constructor(private greeter: Greeter) {}

             static ngComponentDef = defineComponent({
               type: ComponentWithProviders,
               selectors: [['component-with-providers']],
               factory: () => new ComponentWithProviders(directiveInject(Greeter as any)),
               consts: 1,
               vars: 1,
               template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
                 if (fs & RenderFlags.Create) {
                   text(0);
                 }
                 if (fs & RenderFlags.Update) {
                   textBinding(0, bind(ctx.greeter.greet));
                 }
               },
               features: [ProvidersFeature(
                   [{provide: Greeter, useValue: {greet: 'Hallo'}}],
                   [{provide: Greeter, useValue: {greet: 'Bonjour'}}])]
             });
           }

           const fixture =
               new ComponentFixture(ComponentWithProviders, {injector: createInjector(MyModule)});
           expect(fixture.html).toEqual('Bonjour');
         });
    });

    describe('with projection', () => {
      @Component({template: '{{greeter.greet()}}'})
      class GreeterComponent {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: GreeterComponent,
          selectors: [['greeter']],
          factory: () => new GreeterComponent(directiveInject(Greeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: GreeterComponent) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
        });
      }

      it('should work without providers nor viewProviders in component, using module injector as backup',
         () => {
           @Component({template: '<greeter></greeter> - Projected: <ng-content></ng-content>'})
           class ProjectorComponent {
             static ngComponentDef = defineComponent({
               type: ProjectorComponent,
               selectors: [['projector']],
               factory: () => new ProjectorComponent(),
               consts: 3,
               vars: 0,
               template: function(fs: RenderFlags, ctx: ProjectorComponent) {
                 if (fs & RenderFlags.Create) {
                   projectionDef();
                   element(0, 'greeter');
                   text(1, ' - Projected: ');
                   projection(2);
                 }
               },
               directives: [GreeterComponent]
             });
           }

           @Component({template: '<projector><greeter></greeter></projector>'})
           class RootComponent {
             static ngComponentDef = defineComponent({
               type: RootComponent,
               selectors: [['root']],
               factory: () => new RootComponent(),
               consts: 2,
               vars: 0,
               template: function(fs: RenderFlags, ctx: RootComponent) {
                 if (fs & RenderFlags.Create) {
                   elementStart(0, 'projector');
                   element(1, 'greeter');
                   elementEnd();
                 }
               },
               directives: [ProjectorComponent, GreeterComponent]
             });
           }

           const fixture =
               new ComponentFixture(RootComponent, {injector: createInjector(MyModule)});
           expect(fixture.html)
               .toEqual(
                   '<projector><greeter>Hi</greeter> - Projected: <greeter>Hi</greeter></projector>');
         });

      it('should work without providers nor viewProviders in component, using parent element injector as backup',
         () => {
           @Component({template: '<greeter></greeter> - Projected: <ng-content></ng-content>'})
           class ProjectorComponent {
             static ngComponentDef = defineComponent({
               type: ProjectorComponent,
               selectors: [['projector']],
               factory: () => new ProjectorComponent(),
               consts: 3,
               vars: 0,
               template: function(fs: RenderFlags, ctx: ProjectorComponent) {
                 if (fs & RenderFlags.Create) {
                   projectionDef();
                   element(0, 'greeter');
                   text(1, ' - Projected: ');
                   projection(2);
                 }
               },
               directives: [GreeterComponent]
             });
           }

           @Component({
             template: '<projector><greeter></greeter></projector>',
             providers: [{provide: Greeter, useValue: {greet: 'Bonjour'}}],
           })
           class RootComponent {
             static ngComponentDef = defineComponent({
               type: RootComponent,
               selectors: [['root']],
               factory: () => new RootComponent(),
               consts: 2,
               vars: 0,
               template: function(fs: RenderFlags, ctx: RootComponent) {
                 if (fs & RenderFlags.Create) {
                   elementStart(0, 'projector');
                   element(1, 'greeter');
                   elementEnd();
                 }
               },
               directives: [ProjectorComponent, GreeterComponent],
               features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Bonjour'}}])]
             });
           }

           const fixture =
               new ComponentFixture(RootComponent, {injector: createInjector(MyModule)});
           expect(fixture.html)
               .toEqual(
                   '<projector><greeter>Bonjour</greeter> - Projected: <greeter>Bonjour</greeter></projector>');
         });

      it('should work with providers only in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hallo'}}])]
          });
        }

        @Component({
          template: '<projector><greeter></greeter></projector>',
          providers: [{provide: Greeter, useValue: {greet: 'Bonjour'}}],
        })
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent],
            features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Bonjour'}}])]
          });
        }

        const fixture = new ComponentFixture(RootComponent, {injector: createInjector(MyModule)});
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Hallo</greeter> - Projected: <greeter>Hallo</greeter></projector>');
      });

      it('should work with viewProviders only in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          viewProviders: [{provide: Greeter, useValue: {greet: 'Ola'}}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature([], [{provide: Greeter, useValue: {greet: 'Ola'}}])]
          });
        }

        @Component({
          template: '<projector><greeter></greeter></projector>',
          providers: [{provide: Greeter, useValue: {greet: 'Bonjour'}}],
        })
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent],
            features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Bonjour'}}])]
          });
        }

        const fixture = new ComponentFixture(RootComponent, {injector: createInjector(MyModule)});
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Ola</greeter> - Projected: <greeter>Bonjour</greeter></projector>');
      });

      it('should work with both providers and viewProviders in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}}],
          viewProviders: [{provide: Greeter, useValue: {greet: 'Ola'}}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature(
                [{provide: Greeter, useValue: {greet: 'Hallo'}}],
                [{provide: Greeter, useValue: {greet: 'Ola'}}])]
          });
        }

        @Component({
          template: '<projector><greeter></greeter></projector>',
          providers: [{provide: Greeter, useValue: {greet: 'Bonjour'}}],
        })
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent],
            features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Bonjour'}}])]
          });
        }

        const fixture = new ComponentFixture(RootComponent, {injector: createInjector(MyModule)});
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Ola</greeter> - Projected: <greeter>Hallo</greeter></projector>');
      });
    });
  });

  describe('in directives', () => {
    it('should support several directives providing the same token (order in ngComponentDef.directives matters)',
       () => {
         const log: string[] = [];

         @Directive({selector: '[traducteur]'})
         class TraducteurDirective {
           constructor(private greeter: Greeter) { log.push(greeter.greet); }

           static ngDirectiveDef = defineDirective({
             type: TraducteurDirective,
             selectors: [['', 'traducteur', '']],
             factory: () => new TraducteurDirective(directiveInject(Greeter as any)),
             features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Bonjour'}}])]
           });
         }

         @Directive({selector: '[translator]'})
         class TranslatorDirective {
           constructor(private greeter: Greeter) { log.push(greeter.greet); }

           static ngDirectiveDef = defineDirective({
             type: TranslatorDirective,
             selectors: [['', 'translator', '']],
             factory: () => new TranslatorDirective(directiveInject(Greeter as any)),
             features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hallo'}}])]
           });
         }

         @Component({
           template: '{{greeter.greet()}}',
           providers: [{provide: Greeter, useValue: {greet: 'Hi'}}]
         })
         class GreeterComponent {
           constructor(private greeter: Greeter) { log.push(greeter.greet); }

           static ngComponentDef = defineComponent({
             type: GreeterComponent,
             selectors: [['greeter']],
             factory: () => new GreeterComponent(directiveInject(Greeter as any)),
             consts: 1,
             vars: 1,
             template: function(fs: RenderFlags, ctx: GreeterComponent) {
               if (fs & RenderFlags.Create) {
                 text(0);
               }
               if (fs & RenderFlags.Update) {
                 textBinding(0, bind(ctx.greeter.greet));
               }
             },
             features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hi'}}])]
           });
         }

         @Component({
           template: '<greeter translator="" traducteur=""></greeter>',
           providers: [{provide: Greeter, useValue: {greet: 'Ola'}}],
         })
         class RootComponent {
           constructor(private greeter: Greeter) { log.push(greeter.greet); }
           static ngComponentDef = defineComponent({
             type: RootComponent,
             selectors: [['root']],
             factory: () => new RootComponent(directiveInject(Greeter as any)),
             consts: 2,
             vars: 0,
             template: function(fs: RenderFlags, ctx: RootComponent) {
               if (fs & RenderFlags.Create) {
                 element(0, 'greeter', ['translator', '', 'traducteur', '']);
               }
             },
             directives: [TranslatorDirective, TraducteurDirective, GreeterComponent],
             features: [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Ola'}}])]
           });
         }

         const fixture = new ComponentFixture(RootComponent, {injector: createInjector(MyModule)});
         expect(fixture.html).toEqual('<greeter traducteur="" translator="">Bonjour</greeter>');
         expect(log).toEqual(['Ola', 'Bonjour', 'Bonjour', 'Bonjour']);
       });
  });

  describe('multi', () => {
    @Component({template: '{{greeter.greet()}}'})
    class GreeterComponent {
      constructor(private greeter: Greeter[]) {}

      static ngComponentDef = defineComponent({
        type: GreeterComponent,
        selectors: [['greeter']],
        factory: () => new GreeterComponent(directiveInject(Greeter as any)),
        consts: 1,
        vars: 1,
        template: function(fs: RenderFlags, ctx: GreeterComponent) {
          if (fs & RenderFlags.Create) {
            text(0);
          }
          if (fs & RenderFlags.Update) {
            textBinding(0, bind(ctx.greeter.map(g => g.greet).join(' - ')));
          }
        },
      });
    }

    describe('without directive', () => {

      it('should work when only providers in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features:
                [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}])]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent]
          });
        }

        const fixture = new ComponentFixture(RootComponent);
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Hallo</greeter> - Projected: <greeter>Hallo</greeter></projector>');
      });

      it('should throw when only view providers in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          viewProviders: [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature(
                [], [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}])]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent]
          });
        }

        expect(() => new ComponentFixture(RootComponent)).toThrow();
      });

      it('should work when both providers and view Providers in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}],
          viewProviders: [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature(
                [{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}],
                [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}])]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent]
          });
        }

        const fixture = new ComponentFixture(RootComponent);
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Hallo - Bonjour</greeter> - Projected: <greeter>Hallo</greeter></projector>');
      });
    });

    describe('with directive', () => {
      @Directive({
        selector: 'projector',
        providers: [{provide: Greeter, useValue: {greet: 'Ola'}, multi: true}]
      })
      class SomeDirective {
        static ngDirectiveDef = defineDirective({
          type: SomeDirective,
          selectors: [['projector']],
          factory: () => new SomeDirective(),
          features:
              [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Ola'}, multi: true}])]
        });
      }

      it('should work when only providers in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features:
                [ProvidersFeature([{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}])]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent, SomeDirective]
          });
        }

        const fixture = new ComponentFixture(RootComponent);
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Hallo - Ola</greeter> - Projected: <greeter>Hallo - Ola</greeter></projector>');
      });

      it('should work when only view providers in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          viewProviders: [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature(
                [], [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}])]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent, SomeDirective]
          });
        }

        const fixture = new ComponentFixture(RootComponent);
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Bonjour - Ola</greeter> - Projected: <greeter>Ola</greeter></projector>');
      });

      it('should work when both providers and view Providers in component', () => {
        @Component({
          template: '<greeter></greeter> - Projected: <ng-content></ng-content>',
          providers: [{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}],
          viewProviders: [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}],
        })
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent],
            features: [ProvidersFeature(
                [{provide: Greeter, useValue: {greet: 'Hallo'}, multi: true}],
                [{provide: Greeter, useValue: {greet: 'Bonjour'}, multi: true}])]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent, SomeDirective]
          });
        }

        const fixture = new ComponentFixture(RootComponent);
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Hallo - Bonjour - Ola</greeter> - Projected: <greeter>Hallo - Ola</greeter></projector>');
      });

      it('should work when no providers in component', () => {
        @Component({template: '<greeter></greeter> - Projected: <ng-content></ng-content>'})
        class ProjectorComponent {
          static ngComponentDef = defineComponent({
            type: ProjectorComponent,
            selectors: [['projector']],
            factory: () => new ProjectorComponent(),
            consts: 3,
            vars: 0,
            template: function(fs: RenderFlags, ctx: ProjectorComponent) {
              if (fs & RenderFlags.Create) {
                projectionDef();
                element(0, 'greeter');
                text(1, ' - Projected: ');
                projection(2);
              }
            },
            directives: [GreeterComponent]
          });
        }

        @Component({template: '<projector><greeter></greeter></projector>'})
        class RootComponent {
          static ngComponentDef = defineComponent({
            type: RootComponent,
            selectors: [['root']],
            factory: () => new RootComponent(),
            consts: 2,
            vars: 0,
            template: function(fs: RenderFlags, ctx: RootComponent) {
              if (fs & RenderFlags.Create) {
                elementStart(0, 'projector');
                element(1, 'greeter');
                elementEnd();
              }
            },
            directives: [ProjectorComponent, GreeterComponent, SomeDirective]
          });
        }

        const fixture = new ComponentFixture(RootComponent);
        expect(fixture.html)
            .toEqual(
                '<projector><greeter>Ola</greeter> - Projected: <greeter>Ola</greeter></projector>');
      });
    });
  });

  describe('tree-shakable injectables', () => {
    it('should work with root', () => {
      @Injectable({providedIn: 'root'})
      class RootGreeter implements Greeter {
        greet = 'Hello from root';

        static ngInjectableDef =
            defineInjectable({factory: () => new RootGreeter(), providedIn: 'root'});
      }

      @Component({template: '{{greeter.greet()}}'})
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(RootGreeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html).toEqual('Hello from root');
    });

    it('should work with a module', () => {
      @Injectable({providedIn: MyModule})
      class RootGreeter implements Greeter {
        greet = 'Hello from MyModule';

        static ngInjectableDef =
            defineInjectable({factory: () => new RootGreeter(), providedIn: MyModule});
      }

      @Component({template: '{{greeter.greet()}}'})
      class ComponentWithProviders {
        constructor(private greeter: Greeter) {}

        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(directiveInject(RootGreeter as any)),
          consts: 1,
          vars: 1,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              text(0);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.greeter.greet));
            }
          },
        });
      }

      const fixture =
          new ComponentFixture(ComponentWithProviders, {injector: createInjector(MyModule)});
      expect(fixture.html).toEqual('Hello from MyModule');
    });
  });

  it('should support forwardRef', () => {
    @Component({
      template: 'foo',
      providers: [forwardRef(() => ComponentWithProviders)],
    })
    class ComponentWithProviders {
      constructor(public forLater: ForLater) {}

      static ngComponentDef = defineComponent({
        type: ComponentWithProviders,
        selectors: [['component-with-providers']],
        factory: () => new ComponentWithProviders(directiveInject(ForLater)),
        consts: 1,
        vars: 1,
        template: function(fs: RenderFlags, ctx: ForLater) {
          if (fs & RenderFlags.Create) {
            text(0, 'foo');
          }
        },
        features: [ProvidersFeature([forwardRef(() => ForLater)])]
      });
    }

    class ForLater {}

    const fixture = new ComponentFixture(ComponentWithProviders);
    expect(fixture.component.forLater instanceof ForLater).toBeTruthy();
  });

  it('should support embedded views', () => {
    @Component({
      template: '{{greeter.greet()}}',
    })
    class Repeated {
      constructor(private greeter: Greeter) {}

      static ngComponentDef = defineComponent({
        type: Repeated,
        selectors: [['repeated']],
        factory: () => new Repeated(directiveInject(Greeter as any)),
        consts: 1,
        vars: 1,
        template: function(fs: RenderFlags, ctx: Repeated) {
          if (fs & RenderFlags.Create) {
            text(0);
          }
          if (fs & RenderFlags.Update) {
            textBinding(0, bind(ctx.greeter.greet));
          }
        }
      });
    }

    @Component({
      template: `<div>
          % for (let i = 0; i < 3; i++) {
            <repeated></repeated>
          % }
        </div>`,
      viewProviders: [{provide: Greeter, useValue: {greet: 'Salut'}}],
    })
    class ComponentWithProviders {
      static ngComponentDef = defineComponent({
        type: ComponentWithProviders,
        selectors: [['component-with-providers']],
        factory: () => new ComponentWithProviders(),
        consts: 2,
        vars: 0,
        template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
          if (fs & RenderFlags.Create) {
            elementStart(0, 'div');
            { container(1); }
            elementEnd();
          }
          if (fs & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              for (let i = 0; i < 3; i++) {
                let rf1 = embeddedViewStart(1, 2, 1);
                {
                  if (rf1 & RenderFlags.Create) {
                    element(0, 'repeated');
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
        },
        features: [ProvidersFeature([], [{provide: Greeter, useValue: {greet: 'Salut'}}])],
        directives: [Repeated]
      });
    }

    const fixture = new ComponentFixture(ComponentWithProviders);
    expect(fixture.html)
        .toEqual(
            '<div><repeated>Salut</repeated><repeated>Salut</repeated><repeated>Salut</repeated></div>');
  });
});