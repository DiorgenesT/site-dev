import { obterRotacao, obterJitter } from '../estilos/tokens';

interface NotaDeResgateProps {
  texto: string;
}

export function NotaDeResgate({ texto }: NotaDeResgateProps) {
  const letras = texto.split('');

  return (
    <span role="img" aria-label={texto} className="inline-flex gap-1">
      {letras.map((letra, indice) => {
        if (letra.trim() === '') {
          return <span key={`espaco-${indice}`} aria-hidden="true" className="inline-block w-2" />;
        }

        const rotacao = obterRotacao(indice);
        const jitter = obterJitter(indice);
        return (
          <span
            key={`${letra}-${indice}`}
            aria-hidden="true"
            className="inline-block bg-preto-tinta text-branco-papel px-1.5 font-black"
            style={{
              transform: `rotate(${rotacao}deg) translate(${jitter.x}px, ${jitter.y}px)`,
            }}
          >
            {letra}
          </span>
        );
      })}
    </span>
  );
}
