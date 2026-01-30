export interface ControlError<Control = any> {
  errorMessage: string,
  control: Control,
  element: HTMLElement
}
