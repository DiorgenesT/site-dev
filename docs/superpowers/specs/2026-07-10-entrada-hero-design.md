# Entrada em camadas do Hero

Data: 2026-07-10

## Contexto

O Hero e as outras 5 secoes (Sobre, Stack, Projetos, LabIA, Contato) hoje compartilham exatamente os mesmos parametros de animacao de entrada via `useAnimacaoColagem` (GSAP ScrollTrigger): `rotation+14`, `scale 0.9`, `y 24`, `duration 0.6`, `ease back.out(1.6)`, `stagger 0.12`. Feedback do usuario apos testar localmente: as animacoes estao todas muito parecidas, e a entrada do Hero especificamente deveria ser mais impactante e criativa, ja que e o primeiro contato visual com o site.

Decisao tomada em sessao de brainstorming com comparacao visual ao vivo (4 conceitos demonstrados: carimbo/stamp thud, nota de resgate montada, rasgo revelando, colagem em camadas): o usuario escolheu **colagem em camadas** para o Hero. Em seguida, decidiu restringir o escopo: **so o Hero muda**, as outras 5 secoes continuam exatamente como estao hoje (mesmo hook, mesmos parametros, sem diferenciacao entre elas por enquanto).

Decisao tecnica adicional: implementar a entrada do Hero em **CSS puro (`@keyframes`), sem GSAP**. Motivo: o Hero e o unico conteudo sempre visivel no primeiro paint (sem scroll real ate ele). Usar `useAnimacaoColagem` ali dependeria do chunk lazy do GSAP terminar de baixar antes do conteudo aparecer (o hook esconde os elementos com `opacity: 0` ate o `ScrollTrigger` disparar), o que atrasa desnecessariamente o LCP do elemento mais importante da pagina. CSS puro roda no primeiro frame, sem nenhuma dependencia de rede/JS extra.

## Escopo

**Dentro do escopo:**
- Nova animacao de entrada, so para os 4 elementos do Hero (`DG`, subtitulo "Full Stack Developer", descricao, botao "Ver projetos").
- Remocao de `useAnimacaoColagem`/`data-colagem`/`useRef` do `Hero.tsx` (o Hero deixa de participar do sistema de colagem via scroll).
- Novo `@keyframes` e classe utilitaria em `src/index.css`.

**Fora do escopo (explicitamente adiado pelo usuario):**
- Diferenciar a animacao entre Sobre, Stack, Projetos, LabIA e Contato. Essas 5 secoes continuam usando `useAnimacaoColagem` sem nenhuma mudanca.
- Qualquer alteracao em `src/hooks/useAnimacaoColagem.ts` ou `src/lib/gsap.ts`.

## Design

### Mecanismo

Um unico `@keyframes camadaEntrada`, reaproveitado nos 4 elementos do Hero com intensidade diferente via CSS custom properties. Cada elemento entra grande, borrado (`filter: blur`) e rotacionado, "assentando" na posicao final (identidade: escala 1, rotacao 0, sem blur) em sequencia, criando a sensacao de camadas de recorte caindo uma depois da outra.

```css
@keyframes camadaEntrada {
  0% {
    opacity: 0;
    filter: blur(var(--entrada-blur, 6px));
    transform: scale(var(--entrada-escala, 2)) rotate(var(--entrada-rotacao, 20deg))
      translateY(var(--entrada-y, -28px));
  }
  60% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1) rotate(0deg) translateY(0);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .entrada-camada {
    animation: camadaEntrada var(--entrada-duracao, 0.6s) cubic-bezier(0.22, 1.6, 0.36, 1) both;
    animation-delay: var(--entrada-atraso, 0s);
  }
}
```

A regra de animacao fica inteira dentro do `@media (prefers-reduced-motion: no-preference)`: sob reducao de movimento, `.entrada-camada` nao recebe nenhuma `animation`, entao o elemento renderiza direto no estado final (opacidade e transform padrao do navegador), sem nenhum movimento. Isso preserva a regra do `CLAUDE.md` de desligar animacao por completo sob essa preferencia.

`animation-fill-mode: both` (incluido no shorthand) garante duas coisas: (1) durante o `animation-delay`, o elemento ja renderiza no estado do frame `0%` (sem flash do conteudo final antes da animacao comecar); (2) depois que a animacao termina, o elemento fica preso no estado do frame `100%` (identidade), sem depender de nenhuma outra regra CSS pra manter a posicao final.

Cada componente filho (`NotaDeResgate`, `FitaAdesiva`, `Adesivo`, o botao) mantem sua propria rotacao de repouso deterministica (via `obterRotacao` dos tokens) exatamente como hoje. A animacao de camada roda no `div` **wrapper** que ja existe ao redor de cada um, entao as duas transformacoes nao competem: o wrapper anima de "grande e girado" ate "identidade" (sem rotacao propria), e o filho por dentro mantem sua rotacao de tokens intacta o tempo todo.

### Valores por elemento

Intensidade decrescente do primeiro (DG, o mais dramatico) ate o ultimo (CTA), com atraso crescente pra dar a sensacao de sequencia:

| Elemento | atraso | escala | rotacao extra | translateY | blur | duracao |
|---|---|---|---|---|---|---|
| DG (`NotaDeResgate`) | 0s | 2.4 | 26deg | -36px | 8px | 0.65s |
| Subtitulo (`FitaAdesiva`) | 0.14s | 1.8 | 18deg | -24px | 5px | 0.55s |
| Descricao (`Adesivo`) | 0.26s | 1.6 | 14deg | -20px | 4px | 0.5s |
| CTA (botao "Ver projetos") | 0.38s | 1.5 | 12deg | -16px | 3px | 0.5s |

Todos os valores sao constantes fixas (nunca `Math.random` em render), consistente com a regra de determinismo visual do `CLAUDE.md`.

### Mudancas em `Hero.tsx`

- Remove `import { useRef } from 'react'` e `import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem'`.
- Remove `const refSecao = useRef<HTMLElement>(null)` e `useAnimacaoColagem(refSecao)`.
- Remove `ref={refSecao}` e todos os `data-colagem` da secao.
- Cada um dos 4 wrappers ganha `className="entrada-camada ..."` (mantendo as classes de tamanho/layout ja existentes) e um `style` inline com as CSS custom properties da tabela acima, seguindo o padrao ja usado no projeto pra valores dinamicos (`style={{ ... } as React.CSSProperties}`).
- **Cuidado especifico com o botao "Ver projetos":** hoje ele nao tem `div` wrapper, a propria tag `<button>` carrega `style={{ transform: rotate(${obterRotacao(4)}deg) }}`. Uma animacao CSS tem prioridade sobre `style` inline nas propriedades que ela anima; aplicar `entrada-camada` direto no botao faria o frame `100%` (`rotate(0deg)`) sobrescrever a rotacao de repouso do token, zerando-a depois da animacao. Por isso o botao precisa ganhar um `div` wrapper novo (com `entrada-camada` e as CSS vars), igual aos outros 3 elementos, mantendo o `style={{ transform: rotate(...) }}` original so no `<button>` interno.

### Testes

- `Hero.test.tsx`: os testes atuais de conteudo (`getByLabelText('DG')`, `getByText('Full Stack Developer')`, botao "Ver projetos") continuam validos sem mudanca, ja que a animacao nao afeta o DOM renderizado nem o texto acessivel.
- Novo teste (opcional, se fizer sentido): verificar que o Hero **nao** tem mais nenhum elemento com `data-colagem` (documenta a decisao de exclusao do sistema de scroll).

### Performance

- Zero JS adicional, zero dependencia de rede extra: a animacao roda inteira em CSS, no primeiro frame.
- `filter: blur` e `transform`/`opacity` sao compositados pelo navegador (fora da main thread na maioria dos casos), entao nao deve gerar long tasks.
- Resolve o risco de LCP atrasado que a versao anterior (Hero usando `useAnimacaoColagem`) introduzia, ja que o conteudo nao depende mais do chunk lazy do GSAP pra aparecer.

## Fora de escopo / proximos passos possiveis (nao fazer agora)

- Diferenciar Sobre/Stack/Projetos/LabIA/Contato entre si (direcao, velocidade, energia por secao) foi demonstrado no brainstorming e aprovado conceitualmente pelo usuario, mas adiado explicitamente ("alterar apenas o hero"). Pode virar uma proxima issue se o usuario quiser retomar.
