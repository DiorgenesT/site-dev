export const INICIO_ZONA_DOCKING = 0.92;

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
