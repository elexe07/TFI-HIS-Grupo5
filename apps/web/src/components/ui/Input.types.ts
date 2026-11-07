export interface InputProps {
  label?: string
  modelValue?: string
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time'
  size?: 'sm' | 'md' | 'lg'
  id?: string
  name?: string
  autocomplete?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  step?: number
  min?: string | number
  max?: string | number
}