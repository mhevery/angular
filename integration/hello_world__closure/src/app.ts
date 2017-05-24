import {HelloWorldComponent} from './hello-world.component';

import { NgModule, ɵConsole as Console, ErrorHandler, ApplicationInitStatus, ApplicationModule, RendererFactory2,
  Sanitizer, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomPluginRendererFactory } from './dom_plugin_renderer_factory';

export class NoopSanitizer implements Sanitizer {
  sanitize(context: SecurityContext, value: {} | string | any): string | any {
    return value;
  }
}

export function errorHandlerFactory() { return new ErrorHandler(); }

@NgModule({
  providers: [
    Console,
    { provide: ErrorHandler, useFactory: errorHandlerFactory },
    ApplicationInitStatus,
    { provide: RendererFactory2, useClass: DomPluginRendererFactory },
    { provide: Sanitizer, useClass: NoopSanitizer}
  ],
  exports: [
    CommonModule,
    ApplicationModule,
  ]
})
export class BrowserModule {}

@NgModule({
  declarations: [HelloWorldComponent],
  bootstrap: [HelloWorldComponent],
  imports: [BrowserModule],
})
export class AppModule {}
