import { View } from 'react-native';

type Rect = { x: number; y: number; width: number; height: number };
type MeasureInWindow = (
  callback: (x: number, y: number, width: number, height: number) => void,
) => void;

/**
 * O `measureInWindow` do Jest é um `jest.fn()` que nunca responde. Este mock
 * faz toda View "estar" em `rect` (componentes que medem a própria posição).
 */
export function mockMeasureInWindow(rect: Rect) {
  const proto = View.prototype as unknown as {
    measureInWindow: MeasureInWindow;
  };
  return jest
    .spyOn(proto, 'measureInWindow')
    .mockImplementation(callback =>
      callback(rect.x, rect.y, rect.width, rect.height),
    );
}
