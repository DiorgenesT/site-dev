import { useRef } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';
import {
  IconeWhatsApp,
  IconeInstagram,
  IconeLinkedIn,
  IconeGitHub,
} from '../componentes/IconesRedesSociais';

const LINK_WHATSAPP =
  'https://wa.me/5531991519864?text=Ol%C3%A1%2C%20vim%20pelo%20seu%20portf%C3%B3lio%21';

const REDES_SOCIAIS = [
  {
    nome: 'WhatsApp',
    href: LINK_WHATSAPP,
    Icone: IconeWhatsApp,
    corHover: 'hover:text-[#25d366]',
  },
  {
    nome: 'Instagram',
    href: 'https://www.instagram.com/diorgenestavares/',
    Icone: IconeInstagram,
    corHover: 'hover:text-[#e4405f]',
  },
  {
    nome: 'LinkedIn',
    href: 'https://www.linkedin.com/in/diorgenesgeorge/',
    Icone: IconeLinkedIn,
    corHover: 'hover:text-[#0a66c2]',
  },
  {
    nome: 'GitHub',
    href: 'https://github.com/DiorgenesT',
    Icone: IconeGitHub,
    corHover: 'hover:text-[#181717]',
  },
] as const;

export function Contato() {
  const refSecao = useRef<HTMLElement>(null);
  useAnimacaoColagem(refSecao);

  return (
    <section
      ref={refSecao}
      id="contato"
      className="flex flex-col items-center gap-6 px-8 py-16 md:py-24 text-center"
    >
      <h2 data-colagem>
        <FitaAdesiva indice={6}>Vamos conversar?</FitaAdesiva>
      </h2>
      <p className="text-lg max-w-md">
        Tem uma ideia ou um projeto que queira tirar do papel? Me chama.
      </p>
      <div className="flex gap-5 mt-2">
        {REDES_SOCIAIS.map(({ nome, href, Icone, corHover }) => (
          <a
            key={nome}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={nome}
            data-colagem
            className={`text-preto-tinta transition-colors ${corHover}`}
          >
            <Icone className="h-7 w-7" />
          </a>
        ))}
      </div>
    </section>
  );
}
