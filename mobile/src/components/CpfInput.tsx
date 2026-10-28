import { formatCpf } from '../utils/cpf';
import { UnderlineInput, type UnderlineInputProps } from './UnderlineInput';

/** Dígitos do CPF com a máscara `XXX.XXX.XXX-XX`. */
const CPF_MASKED_LENGTH = 14;

type CpfInputProps = Omit<
  UnderlineInputProps,
  'keyboardType' | 'maxLength' | 'textContentType' | 'autoComplete'
>;

/**
 * `UnderlineInput` do CPF (01-design.md, 2.6): teclado numérico e máscara
 * progressiva aplicada a cada mudança, inclusive ao colar só os dígitos.
 */
export function CpfInput({ onChangeText, ...props }: CpfInputProps) {
  return (
    <UnderlineInput
      accessibilityHint="Somente números"
      {...props}
      onChangeText={text => onChangeText(formatCpf(text))}
      keyboardType="number-pad"
      maxLength={CPF_MASKED_LENGTH}
      textContentType="username"
      autoComplete="username"
    />
  );
}
