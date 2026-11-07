/**
 * Composable para llamadas a API con estados de carga, error y datos
 * Separación lógica/presentación - reutilizable en cualquier componente
 */
import { ref, computed, type Ref } from 'vue';
import { HttpError } from '@/services/api';

export interface UseApiState<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<HttpError | null>;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  isIdle: Ref<boolean>;
  isSuccess: Ref<boolean>;
  isError: Ref<boolean>;
  execute: <Args extends unknown[]>(...args: Args) => Promise<T | null>;
  reset: () => void;
}

export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: HttpError) => void;
}

/**
 * Composable genérico para cualquier función async que retorna datos
 */
export function useApi<T, Args extends unknown[] = []>(
  apiFn: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {},
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError } = options;

  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<HttpError | null>(null);

  const isIdle = computed(() => !loading.value && !error.value && data.value === null);
  const isSuccess = computed(() => !loading.value && !error.value && data.value !== null);
  const isError = computed(() => !loading.value && error.value !== null);

  async function execute(...args: Args): Promise<T | null> {
    loading.value = true;
    error.value = null;

    try {
      const result = await apiFn(...args);
      data.value = result;
      onSuccess?.(result);
      return result;
    } catch (err) {
      const httpError = err instanceof HttpError ? err : new HttpError(0, undefined, String(err));
      error.value = httpError;
      onError?.(httpError);
      return null;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    data.value = null;
    loading.value = false;
    error.value = null;
  }

  // Ejecutar inmediatamente si se pide
  if (immediate) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    execute(...([] as unknown as Args));
  }

  return {
    data: data as Ref<T | null>,
    loading: loading as Ref<boolean>,
    error: error as Ref<HttpError | null>,
    isIdle,
    isSuccess,
    isError,
    execute: execute as UseApiReturn<T>['execute'],
    reset,
  };
}

/**
 * Composable para llamadas a API que retornan listas con paginación
 */
export interface UseApiListState<T> {
  items: Ref<T[]>;
  loading: Ref<boolean>;
  error: Ref<HttpError | null>;
  page: Ref<number>;
  totalPages: Ref<number>;
  total: Ref<number>;
}

export interface UseApiListReturn<T> extends UseApiListState<T> {
  load: (page?: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useApiList<T>(
  apiFn: (
    page: number,
    limit: number,
  ) => Promise<{
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>,
  limit = 20,
): UseApiListReturn<T> {
  const items = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<HttpError | null>(null);
  const page = ref(1);
  const totalPages = ref(1);
  const total = ref(0);

  async function load(newPage = page.value) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiFn(newPage, limit);
      items.value = newPage === 1 ? response.data : ([...items.value, ...response.data] as T[]);
      page.value = response.meta.page;
      totalPages.value = response.meta.totalPages;
      total.value = response.meta.total;
    } catch (err) {
      error.value = err instanceof HttpError ? err : new HttpError(0, undefined, String(err));
    } finally {
      loading.value = false;
    }
  }

  async function nextPage() {
    if (page.value < totalPages.value) {
      await load(page.value + 1);
    }
  }

  async function prevPage() {
    if (page.value > 1) {
      await load(page.value - 1);
    }
  }

  async function refresh() {
    await load(1);
  }

  function reset() {
    items.value = [];
    page.value = 1;
    totalPages.value = 1;
    total.value = 0;
    loading.value = false;
    error.value = null;
  }

  return {
    items: items as Ref<T[]>,
    loading: loading as Ref<boolean>,
    error: error as Ref<HttpError | null>,
    page: page as Ref<number>,
    totalPages: totalPages as Ref<number>,
    total: total as Ref<number>,
    load,
    nextPage,
    prevPage,
    refresh,
    reset,
  } as UseApiListReturn<T>;
}

/**
 * Composable para formularios con validación y envío
 */
export interface UseFormState<T> {
  values: Ref<T>;
  errors: Ref<Partial<Record<keyof T, string>>>;
  touched: Ref<Partial<Record<keyof T, boolean>>>;
  submitting: Ref<boolean>;
  submitError: Ref<HttpError | null>;
}

export interface UseFormReturn<T> extends UseFormState<T> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  touch: <K extends keyof T>(field: K) => void;
  validate: (schema: { validate: (values: T) => Partial<Record<keyof T, string>> }) => boolean;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: Event) => Promise<void>;
  reset: (initialValues?: T) => void;
}

export function useForm<T extends Record<string, unknown>>(initialValues: T): UseFormReturn<T> {
  const values = ref<T>({ ...initialValues });
  const errors = ref<Partial<Record<keyof T, string>>>({});
  const touched = ref<Partial<Record<keyof T, boolean>>>({});
  const submitting = ref(false);
  const submitError = ref<HttpError | null>(null);

  function setValue<K extends keyof T>(field: K, value: T[K]) {
    values.value[field] = value;
    clearError(field);
  }

  function setError<K extends keyof T>(field: K, error: string) {
    errors.value[field] = error;
  }

  function clearError<K extends keyof T>(field: K) {
    delete errors.value[field];
  }

  function touch<K extends keyof T>(field: K) {
    touched.value[field] = true;
  }

  function validate(schema: {
    validate: (values: T) => Partial<Record<keyof T, string>>;
  }): boolean {
    const validationErrors = schema.validate(values.value);
    errors.value = validationErrors;
    // Marcar todos como touched para mostrar errores
    Object.keys(values.value).forEach((key) => {
      touched.value[key as keyof T] = true;
    });
    return Object.keys(validationErrors).length === 0;
  }

  function handleSubmit(onSubmit: (values: T) => Promise<void>) {
    return async (e: Event) => {
      e.preventDefault();
      submitError.value = null;

      // Validar usando HTML5 validation si existe
      const form = e.target as HTMLFormElement;
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      submitting.value = true;
      try {
        await onSubmit(values.value);
      } catch (err) {
        submitError.value =
          err instanceof HttpError ? err : new HttpError(0, undefined, String(err));
      } finally {
        submitting.value = false;
      }
    };
  }

  function reset(newInitialValues?: T) {
    values.value = newInitialValues ? { ...newInitialValues } : { ...initialValues };
    errors.value = {};
    touched.value = {};
    submitting.value = false;
    submitError.value = null;
  }

  return {
    values: values as Ref<T>,
    errors: errors as Ref<Partial<Record<keyof T, string>>>,
    touched: touched as Ref<Partial<Record<keyof T, boolean>>>,
    submitting: submitting as Ref<boolean>,
    submitError: submitError as Ref<HttpError | null>,
    setValue,
    setError,
    clearError,
    touch,
    validate,
    handleSubmit,
    reset,
  };
}
