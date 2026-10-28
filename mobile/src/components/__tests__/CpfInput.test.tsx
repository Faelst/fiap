import { fireEvent, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { renderWithTheme } from '../../test/renderWithTheme';
import { CpfInput } from '../CpfInput';

/** CPF controlado, como o ViewModel faz. */
function ControlledCpf({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <CpfInput
      label="CPF"
      testID="login-cpf-input"
      value={value}
      onChangeText={text => {
        setValue(text);
        onChange?.(text);
      }}
    />
  );
}

const input = () => screen.getByTestId('login-cpf-input');
// O rótulo visual fica fora do leitor de tela: quem lê "CPF" é o próprio campo.
const label = () => screen.getByText('CPF', { includeHiddenElements: true });

describe('CpfInput', () => {
  it('aplica a máscara enquanto digita', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<ControlledCpf onChange={onChange} />);

    await fireEvent.changeText(input(), '9692');
    expect(onChange).toHaveBeenLastCalledWith('969.2');
    expect(input()).toHaveProp('value', '969.2');

    await fireEvent.changeText(input(), '969.294.5600');
    expect(input()).toHaveProp('value', '969.294.560-0');
  });

  it('colar só os dígitos vira o CPF mascarado e corta no 11º dígito', async () => {
    await renderWithTheme(<ControlledCpf />);

    await fireEvent.changeText(input(), '9692945600499');

    expect(input()).toHaveProp('value', '969.294.560-04');
  });

  it('teclado numérico, 14 caracteres e preenchimento de usuário', async () => {
    await renderWithTheme(<ControlledCpf />);

    expect(input()).toHaveProp('keyboardType', 'number-pad');
    expect(input()).toHaveProp('maxLength', 14);
    expect(input()).toHaveProp('textContentType', 'username');
    expect(input()).toHaveProp('autoComplete', 'username');
    expect(input()).toHaveProp('accessibilityLabel', 'CPF');
    expect(input()).toHaveProp('accessibilityHint', 'Somente números');
  });

  it('o rótulo fica em negrito com o foco e volta ao sair', async () => {
    await renderWithTheme(<ControlledCpf />);

    expect(label()).toHaveStyle({
      fontFamily: 'Montserrat-Regular',
    });

    await fireEvent(input(), 'focus');
    expect(label()).toHaveStyle({
      fontFamily: 'Montserrat-SemiBold',
    });

    await fireEvent(input(), 'blur');
    expect(label()).toHaveStyle({
      fontFamily: 'Montserrat-Regular',
    });
  });

  it('a linha é inputLine vazia e text preenchida', async () => {
    await renderWithTheme(<ControlledCpf />);

    expect(screen.getByTestId('login-cpf-input-line')).toHaveStyle({
      backgroundColor: '#5C5C5C',
    });

    await fireEvent.changeText(input(), '969');

    expect(screen.getByTestId('login-cpf-input-line')).toHaveStyle({
      backgroundColor: '#FFFFFF',
    });
  });

  it('o valor usa a variante inputValue (32, centralizado)', async () => {
    await renderWithTheme(<ControlledCpf />);

    expect(input()).toHaveStyle({
      fontFamily: 'Montserrat-Regular',
      fontSize: 32,
      textAlign: 'center',
      color: '#FFFFFF',
    });
  });
});
