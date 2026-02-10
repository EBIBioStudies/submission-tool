import { ComputedRef, Ref } from 'vue';
import { PageTab } from '@/models/PageTab.model.ts';


export interface AttributeExpose<> {
  errors: ComputedRef<string[]>;
}

export interface ControlError<Control = any> {
  errorMessage: string,
  control: Control,
  element: HTMLElement
}

export interface SectionExpose<Control = any> {
  errors: ComputedRef<(ControlError<Control>)[]>;
  thisSection?: Ref<PageTab.BuildingSection | PageTab.BuildingSection[]>;
}
