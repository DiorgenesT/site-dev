export const INICIO_ZONA_DOCKING = 0.92;
export const FIM_ZONA_DESMONTE = 0.08;

function suavizar(x: number): number {
  const limitado = Math.min(Math.max(x, 0), 1);
  return limitado * limitado * (3 - 2 * limitado);
}

export function fatorDocking(progresso: number, inicioZona: number): number {
  if (progresso <= inicioZona) {
    return 0;
  }
  const tamanhoZona = 1 - inicioZona;
  const fracao = tamanhoZona === 0 ? 1 : (progresso - inicioZona) / tamanhoZona;
  return suavizar(fracao);
}

// Simetrico a fatorDocking: comeca em 1 (cobra ainda "colada" no botao de
// origem, como um adesivo) e cai suavemente ate 0 ao fim da zona de desmonte,
// quando a cobra solta e passa a percorrer a trajetoria livre. Reaproveita
// fatorDocking invertendo progresso e zona, em vez de duplicar a logica de
// easing (mesma curva smoothstep, mesmo principio de zona fixa).
export function fatorDesmonte(progresso: number, fimZona: number): number {
  return fatorDocking(1 - progresso, 1 - fimZona);
}
