import type { RefObject } from 'react';

interface ContatoProps {
  refSecao: RefObject<HTMLElement>;
  refBotao: RefObject<HTMLAnchorElement>;
}

const LINK_WHATSAPP = 'https://wa.me/5531991519864?text=Ola%2C%20vim%20pelo%20seu%20portfolio%21';

export function Contato({ refSecao, refBotao }: ContatoProps) {
  return (
    <section
      ref={refSecao}
      id="contato"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8"
    >
      <h2 className="text-2xl font-bold">Vamos conversar?</h2>
      <a
        ref={refBotao}
        href={LINK_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest"
      >
        Fale comigo
      </a>
    </section>
  );
}
