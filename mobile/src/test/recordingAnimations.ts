/**
 * Builders de animação de layout que só anotam a configuração. O mock do
 * Reanimated devolve sempre a mesma instância e ignora os argumentos, então
 * não dá para conferir duração, atraso ou reduzir movimento de um `entering`.
 * Use dentro de um `jest.mock('react-native-reanimated', ...)` do arquivo de
 * teste e leia o `entering` da view: `node.props.entering`.
 */
export type RecordedAnimation = {
  name: string;
  /** Só no `Keyframe`: o objeto passado ao construtor. */
  keyframes?: unknown;
  /** Último argumento de cada método chamado (`duration`, `delay`...). */
  calls: Record<string, unknown>;
};

const BUILDER_METHODS = [
  'duration',
  'delay',
  'easing',
  'withInitialValues',
  'reduceMotion',
  'withCallback',
] as const;

type Builder = RecordedAnimation &
  Record<(typeof BUILDER_METHODS)[number], (value: unknown) => Builder>;

function createBuilder(name: string, keyframes?: unknown): Builder {
  const builder = { name, keyframes, calls: {} } as Builder;
  for (const method of BUILDER_METHODS) {
    builder[method] = (value: unknown) => {
      builder.calls[method] = value;
      return builder;
    };
  }
  return builder;
}

/** `FadeIn.duration(...)`: cada cadeia começa num builder novo. */
function presetAnimation(name: string) {
  const preset = {} as Record<
    (typeof BUILDER_METHODS)[number],
    (value: unknown) => Builder
  >;
  for (const method of BUILDER_METHODS) {
    preset[method] = (value: unknown) => createBuilder(name)[method](value);
  }
  return preset;
}

class RecordingKeyframe {
  constructor(keyframes: unknown) {
    return createBuilder('Keyframe', keyframes);
  }
}

export const recordingAnimations = () => ({
  FadeIn: presetAnimation('FadeIn'),
  FadeInDown: presetAnimation('FadeInDown'),
  Keyframe: RecordingKeyframe,
});
