export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  modelValue: boolean;
  title?: string;
  size?: ModalSize;
  closable?: boolean;
}
