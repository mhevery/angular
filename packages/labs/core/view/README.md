# View

The `view` directory contains new APIs for working with Angular views which are meant as a replacement for:
- `ElementRef` => just element (`HTMLElement` or `Element`)
- `EmbeddedViewRef` => `EmbeddedView`
- `ViewContainerRef` => `ViewContainer`
- `ViewRef` => `ComponentView`
- `TemplateRef` => `Template`
- `ChangeDetectorRef` => Just use component instance.
- `NgModuleFactory` => Just use module instance.
- `ComponentFactory` => Not needed, replaced by component type.
- `ComponentRef` => Not needed, replaced by component instance.