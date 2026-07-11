import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Projetos } from './Projetos';

describe('Projetos', () => {
  it('renderiza os 4 projetos pessoais, com Tudo Em Dia linkando pro produto real', () => {
    render(<Projetos />);

    expect(screen.getByText('Tudo Em Dia')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Ponto')).toBeInTheDocument();
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument();
    expect(screen.getByText('ingestao-async')).toBeInTheDocument();

    const linksProjeto = screen.getAllByRole('link', { name: 'Ver projeto' });
    const linkTudoEmDia = linksProjeto.find(
      (link) => link.getAttribute('href') === 'https://tatudoemdia.com.br/',
    );
    expect(linkTudoEmDia).toBeDefined();
  });

  it('renderiza os 5 projetos da Fundacao Beta, com noticia em Fundacao Beta, UPA Agora, Portal do Servidor e ODS', () => {
    render(<Projetos />);

    expect(screen.getByText('Fundação Beta')).toBeInTheDocument();
    expect(screen.getByText('UPA Agora')).toBeInTheDocument();
    expect(screen.getByText('IEGM Betim')).toBeInTheDocument();
    expect(screen.getByText('Portal do Servidor')).toBeInTheDocument();
    expect(screen.getByText('ODS Betim')).toBeInTheDocument();

    const linksNoticia = screen.getAllByRole('link', { name: 'Na mídia' });
    expect(linksNoticia).toHaveLength(4);
  });

  it('agrupa os projetos em dois blocos com subtitulo', () => {
    render(<Projetos />);

    expect(screen.getByText('Fundação Beta / Prefeitura de Betim')).toBeInTheDocument();
    expect(screen.getByText('Projetos pessoais')).toBeInTheDocument();
  });
});
