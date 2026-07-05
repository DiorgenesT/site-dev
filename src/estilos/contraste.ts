type CorHex = `#${string}`;

function paraLinear(canal: number): number {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminanciaRelativa(hex: CorHex): number {
  const valor = hex.replace('#', '');
  const r = parseInt(valor.substring(0, 2), 16);
  const g = parseInt(valor.substring(2, 4), 16);
  const b = parseInt(valor.substring(4, 6), 16);
  return 0.2126 * paraLinear(r) + 0.7152 * paraLinear(g) + 0.0722 * paraLinear(b);
}

export function calcularContraste(corA: CorHex, corB: CorHex): number {
  const luminanciaA = luminanciaRelativa(corA);
  const luminanciaB = luminanciaRelativa(corB);
  const maior = Math.max(luminanciaA, luminanciaB);
  const menor = Math.min(luminanciaA, luminanciaB);
  return (maior + 0.05) / (menor + 0.05);
}
