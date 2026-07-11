# Moldura de capa de fanzine na Hero (desktop)

Data: 2026-07-11

## Contexto

Feedback do usuario: a Hero tem espaco em branco excessivo, especificamente em telas largas de desktop (nao em mobile/tablet). Hoje o conteudo da Hero e uma coluna centralizada (`flex flex-col items-center`) com largura efetiva de `max-w-md` no maior elemento (a descricao), entao em telas largas sobra bastante vazio nas laterais.

Brainstorming com comparativo visual (artefato HTML com 3 opcoes montadas com as pecas reais do site: `NotaDeResgate`, `FitaAdesiva`, `Adesivo`, `Carimbo`): o usuario escolheu a opcao **"capa de fanzine"**, que preenche as bordas da Hero com marcas que uma capa de zine xerocada teria (edicao, selo de data, fita cruzando a quina, lombada), em vez de reestruturar o layout em colunas (opcao rejeitada por se aproximar do padrao texto+imagem que o `CLAUDE.md` pede pra evitar) ou so encolher o espacamento vertical (opcao que nao resolvia o vazio lateral relatado).

## Escopo

**Dentro do escopo:**
- 4 elementos decorativos novos na Hero, so visiveis a partir do breakpoint `lg` (1024px): marca de edicao, selo de data/local, tira de fita no canto, lombada de texto vertical.
- Mudancas em `src/secoes/Hero.tsx` apenas.

**Fora do escopo:**
- Qualquer mudanca no mobile/tablet (`< lg`): a Hero continua pixel-identica ao que e hoje abaixo de 1024px.
- Qualquer mudanca nas outras secoes (Sobre, Stack, Projetos, LabIA, Contato).
- Novos componentes em `src/componentes/`: os 4 elementos sao marcacao simples direto no `Hero.tsx`, nao justificam abstracao (usados uma unica vez, cada um com estilo proprio).
- Mudanca no sistema `entrada-camada` existente (`@keyframes camadaEntrada` em `src/index.css`): os elementos novos reaproveitam a classe e o mecanismo ja existentes, sem alterar o CSS compartilhado.

## Design

### Os 4 elementos

Todos com `aria-hidden="true"` (decoracao atmosferica, nao informacao essencial: nome, cargo, descricao e CTA continuam sendo o conteudo real e acessivel da Hero, sem mudanca). Todos com rotacao fixa (constante, nunca `Math.random`), consistente com a regra de determinismo visual do projeto.

1. **Marca de edicao** (canto superior esquerdo): texto `Edicao Nº 01`, pequeno, uppercase, tracking largo, cor `preto-tinta` com opacidade reduzida (mesmo tratamento visual de legenda que o resto do site usa pra texto secundario).
2. **Selo de data/local** (canto superior direito): texto `Betim, 2026` dentro de uma caixa com borda fina (`border border-preto-tinta/20`), como um carimbo de correio.
3. **Fita no canto** (canto inferior esquerdo): uma tira solida `bg-amarelo-fita opacity-90`, sem texto, rotacionada cruzando a quina inferior esquerda da secao, parcialmente sangrando pra fora (`-left-6`) pra parecer colada por cima da borda.
4. **Lombada** (borda direita, centralizada verticalmente): texto `diorgenesgeorge.dev`, uppercase, tracking largo, rotacionado 90 graus (`transform: rotate(90deg)`, mesma tecnica de `transform` ja usada no projeto, sem introduzir `writing-mode`).

### Posicionamento

A `<section id="hero">` ganha `relative` (hoje nao tem, e nao tem nenhum filho posicionado). Os 4 elementos sao `absolute`, com `hidden lg:block` (marca de edicao, selo, lombada) ou `hidden lg:flex` conforme o elemento, ancorados nos cantos/borda com o mesmo espacamento do `px-8` da secao (`top-8 left-8`, `top-8 right-8`, etc), pra alinhar visualmente com a margem que o conteudo central ja respeita.

### Entrada/animacao

Os 4 elementos reaproveitam a classe `.entrada-camada` ja existente em `src/index.css` (nenhuma mudanca no CSS compartilhado), com CSS custom properties proprias definidas inline no `Hero.tsx`, seguindo exatamente o padrao dos 4 elementos que ja existem (`entradaDg`, `entradaSubtitulo`, `entradaDescricao`, `entradaCta`). Intensidade mais sutil que o conteudo central (esses sao decoracao de fundo, nao devem competir visualmente) e atraso maior, entrando depois que o conteudo principal ja assentou:

| Elemento | atraso | escala | rotacao extra | translateY | blur | duracao |
|---|---|---|---|---|---|---|
| Marca de edicao | 0.5s | 1.4 | 10deg | -12px | 3px | 0.45s |
| Selo de data/local | 0.58s | 1.4 | -10deg | -12px | 3px | 0.45s |
| Fita no canto | 0.66s | 1.3 | -8deg | 10px | 2px | 0.4s |
| Lombada | 0.74s | 1.3 | 8deg | 8px | 2px | 0.4s |

Sob `prefers-reduced-motion: reduce`, o mecanismo existente ja desliga a animacao por completo (regra dentro de `@media (prefers-reduced-motion: no-preference)`), entao os 4 elementos novos herdam esse comportamento automaticamente sem nenhum codigo extra: renderizam direto no estado final, sem movimento.

### Acessibilidade

- `aria-hidden="true"` nos 4 elementos: o conteudo textual e puramente decorativo (nao e informacao que um usuario de leitor de tela precisa), o conteudo real da Hero (nome, cargo, descricao, CTA) continua exatamente como esta hoje, sem nenhuma mudanca de ordem ou semantica.
- Nenhum elemento novo e focavel nem interativo, entao nao entra na ordem de tabulacao.
- Contraste: marca de edicao e selo usam `preto-tinta` sobre `branco-papel` (alto contraste, ja usado no resto do site); a fita usa `amarelo-fita` solido, mesma cor ja validada em `FitaAdesiva` em outros lugares do site.

### Performance

- Zero JS novo: reaproveita a mesma animacao CSS pura ja usada no Hero (sem GSAP, sem dependencia de rede extra).
- Zero imagem nova: os 4 elementos sao texto e uma `div`/`span` com cor solida, nenhum SVG ou PNG adicional.
- `hidden lg:block` remove os elementos do DOM renderizado (`display: none`) em telas menores que 1024px, entao nao ha custo nenhum de layout/paint em mobile.

## Fora de escopo / proximos passos possiveis (nao fazer agora)

- Ajustar o breakpoint de exibicao (`lg` vs `md` vs `xl`) depois de ver o resultado em telas intermediarias (laptop 13", ~1280px) e mobile real; validar durante o teste local antes de comitar.
- Tornar o texto do selo dinamico (ano atual via `Date`) em vez de fixo `2026`; adiado por simplicidade, ja que o site nao tem hoje nenhum outro texto dinamico baseado em data.
