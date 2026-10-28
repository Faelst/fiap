import type { LogTransport } from './logger';

/**
 * Escreve no console no nível do log. O método é lido na hora da chamada
 * (não guardado ao carregar o módulo), para quem troca o console depois, como
 * o LogBox ou um spy de teste, receber o log.
 */
export const consoleTransport: LogTransport = ({ level, message, context }) => {
  if (context === undefined) {
    console[level](`[${level}] ${message}`);
  } else {
    console[level](`[${level}] ${message}`, context);
  }
};
