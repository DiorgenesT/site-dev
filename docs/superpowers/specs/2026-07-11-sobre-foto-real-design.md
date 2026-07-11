# Foto real do Diorgenes na secao Sobre, com moldura tematica

Data: 2026-07-11

## Contexto

A Sobre usa hoje `foto-preta-branca.webp`: nao e um filtro aplicado na foto original, e uma versao inteiramente reprocessada (halftone denso, borda rasgada e fita adesiva ja "queimados" nos pixels da imagem, gerados fora do fluxo normal do projeto). O usuario tem a foto original (`foto.png`, colorida, 800x800, ele trabalhando com notebook) e quer usar essa foto de verdade na Sobre, sem ela aparecer "crua" (sem nenhum tratamento), mas tambem sem repetir o excesso da versao anterior.

Brainstorming com testes visuais reais (processamento em Python/Pillow, publicado como comparativo em HTML pro usuario avaliar):

1. Primeira tentativa: halftone CMYK de 4 canais separados (simulando impressao offset). Resultado: as 4 grades de pontos desalinhadas (angulos diferentes por canal) geravam combinacoes de cor aleatorias pixel a pixel, um "confete" sem nexo.
2. Segunda tentativa: halftone de grade unica (um ponto por celula, cor = media real da regiao, tamanho = luminancia). Ficou coerente e reconhecivel em resolucao alta, mas o usuario achou estranho demais pra uma foto pessoal seguinte de perto.
3. Terceira tentativa: halftone bem mais fino (ponto pequeno). No tamanho real de exibicao da Sobre (~256px de largura), o ponto fica pequeno demais pra formar padrao legivel e vira mancha, parecendo artefato de compressao em vez de estilo proposital.
4. Quarta tentativa (aprovada): sem halftone nenhum. Foto nitida, so com ajuste leve de cor/contraste/brilho, decisao de que o "nao crua" vem inteiramente da **moldura tematica** (componentes que ja existem no site), nao de processamento pesado de pixel.

## Escopo

**Dentro do escopo:**
- Novo asset estatico `public/image/foto-sobre.webp`: `foto.png` recortada em 3:4 centralizada no rosto, com grading leve (cor, contraste, brilho), processada offline (Python/Pillow, fora do build do Vite), sem halftone.
- Remocao de `public/image/foto-preta-branca.webp` do repositorio (nenhuma outra referencia a esse arquivo no codigo).
- Mudancas em `src/secoes/Sobre.tsx`: troca do `src` da imagem e adicao da moldura tematica (`PapelRasgado` no topo e na base do quadro, uma tira de fita decorativa no canto, rotacao fixa no quadro).

**Fora do escopo:**
- Qualquer mudanca no texto/trajetoria da Sobre (paragrafos ja aprovados em feature anterior).
- Qualquer mudanca em `PapelRasgado.tsx` ou `FitaAdesiva.tsx` (reuso direto, sem alterar os componentes).
- Automatizar o processamento de imagem como parte do build do Vite: o processamento e um passo manual/offline, o resultado e um asset estatico versionado, igual ao padrao ja existente no projeto (a propria `foto-preta-branca.webp` tambem foi gerada fora do build).

## Design

### Imagem

- Origem: `public/image/foto.png` (800x800, colorida).
- Recorte: 3:4 vertical, centralizado horizontalmente (mesmo enquadramento validado nos testes visuais, mantem o rosto centralizado).
- Tratamento: `ImageEnhance.Color` 1.2x, `ImageEnhance.Contrast` 1.12x, `ImageEnhance.Brightness` 1.05x (valores usados no preview que o usuario aprovou). Sem halftone, sem filtro de pontos.
- Saida: `public/image/foto-sobre.webp`, 720px de largura (960px de altura), qualidade 88, ~44KB. Processado uma unica vez, offline, resultado versionado no repositorio (consistente com "halftone aplicado em build, nao em runtime" do `CLAUDE.md`: aqui nem ha halftone, mas o principio de processamento pesado fora do runtime do navegador continua valendo).

### Moldura

Reaproveita componentes que ja existem, nenhum componente novo:

1. **`PapelRasgado`** no topo do quadro da foto (borda rasgada), e outro `PapelRasgado` na base, rotacionado 180 graus (`transform: rotate(180deg)`) pra rasgo ficar voltado pra cima também na borda inferior. Cor herdada via `text-branco-papel` (o componente usa `currentColor`), pra ficar no tom do papel de fundo da secao.
2. **Tira de fita decorativa** no canto superior esquerdo do quadro: elemento novo simples (nao um componente, mesmo padrao ja usado nos 4 elementos da moldura da Hero), `aria-hidden="true"`, `bg-amarelo-fita opacity-90`, rotacionado com valor fixo, posicionado `absolute` levemente sangrando pra fora do canto do quadro.
3. **Rotacao do quadro inteiro**: o `div` que envolve a foto (mesmo que hoje tem `w-56 sm:w-64 aspect-[3/4] overflow-hidden shadow-lg`) ganha uma rotacao fixa leve via `obterRotacao` dos tokens (o mesmo principio de determinismo visual usado no resto do site), pra moldura nao ficar perfeitamente esquadrejada.

A entrada por scroll (`data-colagem`, jah gerenciada por `useAnimacaoColagem` no `refConteudo` que envolve toda a Sobre) continua exatamente como esta: o `data-colagem` fica no `div` externo do quadro (que agora inclui moldura + foto), igual a hoje.

### Acessibilidade

- `alt` da imagem atualizado pra descrever a foto real (nao mais "ilustrada em preto e branco"): algo como "Foto de Diorgenes George, trabalhando em um notebook".
- `PapelRasgado` (duas instancias) e a fita decorativa continuam `aria-hidden="true"` (decoracao, sem informacao), a foto em si mantem `alt` descritivo real.
- Contraste: nao se aplica texto sobre a foto, sem risco de contraste insuficiente.

### Performance

- Novo asset (~44KB) e mais leve que o antigo (`foto-preta-branca.webp`, ~197KB): reduz o peso da secao Sobre.
- Nenhum JS novo: moldura e so marcacao/CSS, mesma logica de rotacao fixa ja usada em outros lugares do site.
- `foto-preta-branca.webp` removida evita peso morto no repositorio (nada mais referencia esse arquivo).

## Fora de escopo / proximos passos possiveis (nao fazer agora)

- Gerar uma versao 2x (retina) do asset (`foto-sobre@2x.webp` + `srcset`) fica pra uma iteracao futura caso a nitidez em telas de alta densidade vire um problema percebido; o teste visual aprovado ja usa 720px de largura pra um quadro exibido a ~256px, o que ja da alguma folga pra 2x.
