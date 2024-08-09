import { TemplateRef } from '@angular/core';

/**
 * @ignore
 */
export type TabConfig = {
  [x: string]: string;
  title: string;
  icon: string;
  // @ts-ignore
  template: TemplateRef<any>;
  class: string;
};
