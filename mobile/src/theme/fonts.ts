/**
 * Montserrat embutida (assets/fonts). O nome é o PostScript name no iOS e o
 * nome do arquivo no Android, que aqui coincidem. O peso vem só daqui: nunca
 * use `fontWeight` com fonte customizada (no Android cai na fonte do sistema).
 */
export const fonts = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
} as const;
