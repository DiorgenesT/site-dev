import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { construirTrajetoria } from '../cobra/trajetoria';
import type { Trajetoria } from '../cobra/trajetoria';
import {
  criarBufferCircular,
  inserirPosicao,
  criarQuantizador,
  avancarQuantizador,
  TAMANHO_BUFFER_CORPO,
  PASSOS_POR_SEGUNDO,
  type BufferCircular,
} from '../cobra/motor';
import {
  fatorDocking,
  INICIO_ZONA_DOCKING,
  fatorDesmonte,
  FIM_ZONA_DESMONTE,
} from '../cobra/docking';
import type { Ponto } from '../cobra/tipos';
import { carregarGsap, ScrollTrigger } from '../lib/gsap';
import { iniciarMovimento, pararMovimento } from '../lib/movimento';

interface OpcoesCobra {
  // Uma ancora por secao, na ordem em que aparecem na pagina (Hero primeiro,
  // Contato por ultimo). A trajetoria da cobra passa por todas elas.
  refsSecoes: readonly RefObject<HTMLElement | null>[];
  refJornada: RefObject<HTMLElement | null>;
}

interface EstadoCobra {
  bufferRef: RefObject<BufferCircular>;
  fatorDocking: number;
  fatorDesmonte: number;
  scrollRef: RefObject<Ponto>;
  cobraAtiva: boolean;
}

function elementoParaPonto(elemento: HTMLElement): Ponto {
  const retangulo = elemento.getBoundingClientRect();
  return {
    x: retangulo.left + retangulo.width / 2 + window.scrollX,
    y: retangulo.top + retangulo.height / 2 + window.scrollY,
  };
}

export function useCobra({ refsSecoes, refJornada }: OpcoesCobra): EstadoCobra {
  const bufferRef = useRef<BufferCircular>(criarBufferCircular(TAMANHO_BUFFER_CORPO));
  // Ponto reutilizado pela amostragem quantizada (12x/s): evita alocar um Ponto
  // novo por tick, na mesma linha do buffer circular do corpo.
  const amostraRef = useRef<Ponto>({ x: 0, y: 0 });
  // Cache do scroll atual para o canvas fixed converter coordenadas de pagina
  // (dos waypoints) em coordenadas de viewport sem ler window.scrollX/scrollY
  // dentro do loop de desenho (contrato, pontos 3 e 4). So e escrito no mount
  // e em callbacks ja acionados fora do rAF de desenho (onUpdate do
  // ScrollTrigger e resize debounced).
  const scrollRef = useRef<Ponto>({ x: 0, y: 0 });
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // Os botoes reais nao dependem mais destes valores para ficarem visiveis
  // (correcao de acessibilidade, spec Fase 2 secao 3.3) - por isso os dois
  // fatores comecam neutros (0), sem precisar de caso especial para
  // reduced-motion. O fallback estatico funcional agora vem inteiramente de
  // cobraAtiva=false, que desliga o desenho decorativo da cobra.
  const [fatorDockingAtual, setFatorDockingAtual] = useState(0);
  const [fatorDesmonteAtual, setFatorDesmonteAtual] = useState(0);
  // Visibilidade combinada (aba em foco e secao da jornada na tela). Comeca
  // true: o efeito abaixo corrige para o valor real assim que os observers
  // disparam, e com reduced-motion o efeito nem chega a rodar.
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const elementosSecoes = refsSecoes.map((ref) => ref.current);
    const elementoJornada = refJornada.current;
    if (elementosSecoes.some((elemento) => elemento === null) || !elementoJornada) {
      return undefined;
    }
    const elementosValidados = elementosSecoes as HTMLElement[];
    const elementoInicio = elementosValidados[0];
    const elementoFim = elementosValidados[elementosValidados.length - 1];
    if (!elementoInicio || !elementoFim) {
      return undefined;
    }

    let trajetoria: Trajetoria = construirTrajetoria(elementosValidados.map(elementoParaPonto));
    const quantizador = criarQuantizador(PASSOS_POR_SEGUNDO);
    let progressoAtual = 0;
    let visivelAba = document.visibilityState === 'visible';
    let visivelTela = true;

    scrollRef.current.x = window.scrollX;
    scrollRef.current.y = window.scrollY;

    const gsap = carregarGsap();

    const scrollTrigger = ScrollTrigger.create({
      trigger: elementoInicio,
      endTrigger: elementoFim,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressoAtual = self.progress;
        // self.scroll() e o valor de scroll que o proprio ScrollTrigger ja
        // recalculou neste ciclo (disparado pelo evento 'scroll' do Lenis),
        // entao cachear aqui nao introduz uma leitura de layout por frame.
        scrollRef.current.y = self.scroll();
      },
    });

    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    // Arrow function (nao function declaration): preserva o estreitamento de tipo
    // de elementosValidados dentro do closure.
    const aoRedimensionar = (): void => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        trajetoria = construirTrajetoria(elementosValidados.map(elementoParaPonto));
        scrollRef.current.x = window.scrollX;
        scrollTrigger.refresh();
      }, 150);
    };
    const observadorRedimensionamento = new ResizeObserver(aoRedimensionar);
    observadorRedimensionamento.observe(document.body);

    function aoMudarVisibilidadeAba(): void {
      visivelAba = document.visibilityState === 'visible';
      setVisivel(visivelAba && visivelTela);
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidadeAba);

    // Observa o container que envolve toda a jornada (inicio ao fim), nao so a
    // ancora de inicio: assim visivelTela so vira false quando a jornada inteira
    // sai da tela, nao assim que o usuario rola um pouco alem da ancora inicial.
    const observadorIntersecao = new IntersectionObserver(
      (entradas) => {
        const entrada = entradas[0];
        visivelTela = entrada ? entrada.isIntersecting : true;
        setVisivel(visivelAba && visivelTela);
      },
      { threshold: 0 },
    );
    observadorIntersecao.observe(elementoJornada);

    function aoTick(_tempo: number, deltaMs: number): void {
      if (!visivelAba || !visivelTela) {
        return;
      }
      const avancou = avancarQuantizador(quantizador, deltaMs);
      if (avancou) {
        trajetoria.amostrar(progressoAtual, amostraRef.current);
        inserirPosicao(bufferRef.current, amostraRef.current);
        setFatorDockingAtual(fatorDocking(progressoAtual, INICIO_ZONA_DOCKING));
        setFatorDesmonteAtual(fatorDesmonte(progressoAtual, FIM_ZONA_DESMONTE));
      }
    }

    gsap.ticker.add(aoTick);
    iniciarMovimento();

    return () => {
      gsap.ticker.remove(aoTick);
      pararMovimento();
      scrollTrigger.kill();
      observadorRedimensionamento.disconnect();
      observadorIntersecao.disconnect();
      document.removeEventListener('visibilitychange', aoMudarVisibilidadeAba);
      clearTimeout(resizeTimeoutId);
    };
  }, [refsSecoes, refJornada, reducedMotion]);

  return {
    bufferRef,
    fatorDocking: fatorDockingAtual,
    fatorDesmonte: fatorDesmonteAtual,
    scrollRef,
    // Contrato pontos 7 e 8: cobra so desenha sem reduced-motion e com a
    // jornada visivel (aba em foco e secao na tela).
    cobraAtiva: !reducedMotion && visivel,
  };
}
