import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import type { TextInputInstance } from 'react-native';

import { strings } from '../../constants/strings';
import type { ApiError } from '../../services/http/errors';
import { useSessionStore } from '../../stores/session.store';
import { formatCpf, onlyDigits } from '../../utils/cpf';
import { useLoginMutation } from './api/useLoginMutation';
import { loginFormSchema, type LoginForm } from './schemas';

const CPF_DIGITS = 11;

/** Texto da tela para cada erro do login (01-design.md, 3.2 e 5). */
function messageFor(error: ApiError): string | null {
  switch (error.kind) {
    case 'canceled':
      return null;
    case 'unauthorized':
      return strings.login.error.invalid;
    case 'rateLimited':
      return strings.login.error.tooMany;
    case 'network':
      return strings.login.error.network;
    case 'storage':
      // Mensagem do próprio app, montada no useLoginMutation.
      return error.message;
    default:
      return strings.login.error.server;
  }
}

/**
 * ViewModel do Login (M1, M2). O formulário é react-hook-form com o
 * `loginFormSchema` (zod); o envio é o `useLoginMutation`, que grava o token
 * e abre a sessão. Com a sessão aberta o RootStack troca o Login pelas abas,
 * então o sucesso não navega daqui.
 */
export function useLoginViewModel() {
  const expiredOnOpen = useSessionStore(
    state => state.signOutReason === 'expired',
  );
  const mutation = useLoginMutation();
  const { control, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: { cpf: '', password: '' },
  });
  const { field: cpfField } = useController({ control, name: 'cpf' });
  const { field: passwordField } = useController({
    control,
    name: 'password',
  });

  const passwordRef = useRef<TextInputInstance>(null);
  const [showExpired, setShowExpired] = useState(expiredOnOpen);
  const [showCpfError, setShowCpfError] = useState(false);

  const isSubmitting = mutation.isPending;
  const canSubmit = formState.isValid && !isSubmitting;

  /** Editar qualquer campo apaga a mensagem que estiver na tela (3.2). */
  const clearMessages = () => {
    setShowExpired(false);
    setShowCpfError(false);
    if (mutation.isError) mutation.reset();
  };

  const submitError = mutation.error ? messageFor(mutation.error) : null;
  /**
   * Muda a cada envio que falha (o `submittedAt` é de cada `mutate`) e volta
   * a 0 quando o erro sai da tela. Derivado no render, sem estado extra.
   */
  const shakeKey =
    mutation.error && mutation.error.kind !== 'canceled'
      ? mutation.submittedAt
      : 0;
  const errorMessage =
    submitError ??
    (showCpfError ? strings.login.error.cpf : null) ??
    (showExpired ? strings.login.error.sessionExpired : null);

  const submit = handleSubmit(values => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  });

  return {
    cpf: {
      value: cpfField.value,
      onChangeText: (text: string) => {
        clearMessages();
        cpfField.onChange(formatCpf(text));
      },
      onBlur: () => {
        cpfField.onBlur();
        const { value } = cpfField;
        const complete = onlyDigits(value).length === CPF_DIGITS;
        if (complete && !loginFormSchema.shape.cpf.safeParse(value).success) {
          setShowCpfError(true);
        }
      },
    },
    password: {
      value: passwordField.value,
      onChangeText: (text: string) => {
        clearMessages();
        passwordField.onChange(text);
      },
      onBlur: passwordField.onBlur,
    },
    passwordRef,
    /** "next" do teclado do CPF. */
    focusPassword: () => passwordRef.current?.focus(),
    /** Botão e "go" do teclado da senha. Ignora se o formulário não vale. */
    submit: () => {
      submit();
    },
    canSubmit,
    isSubmitting,
    errorMessage,
    /** Muda a cada erro de envio: a View faz o shake do formulário. */
    shakeKey,
  };
}
