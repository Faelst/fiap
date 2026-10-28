import { ReduceMotion } from 'react-native-reanimated';

import type { RecordedAnimation } from '../../test/recordingAnimations';
import { enterDown, motion } from '../motion';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  ...jest.requireActual('../../test/recordingAnimations').recordingAnimations(),
}));

describe('enterDown', () => {
  it('é a entrada padrão: FadeInDown em `base`, easeOut, 8 pt e reduzir movimento do sistema', () => {
    const entering = enterDown(motion, 120) as unknown as RecordedAnimation;

    expect(entering.name).toBe('FadeInDown');
    expect(entering.calls).toEqual({
      duration: motion.base,
      delay: 120,
      easing: motion.easeOut,
      withInitialValues: {
        transform: [{ translateY: motion.enterOffsetSmall }],
      },
      reduceMotion: ReduceMotion.System,
    });
  });

  it('sem atraso por padrão', () => {
    const entering = enterDown(motion) as unknown as RecordedAnimation;

    expect(entering.calls.delay).toBe(0);
  });
});
