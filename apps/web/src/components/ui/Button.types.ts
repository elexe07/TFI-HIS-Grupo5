export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  class?: string | string[] | Record<string, boolean>;
  style?: string | Record<string, string | number>;
}
