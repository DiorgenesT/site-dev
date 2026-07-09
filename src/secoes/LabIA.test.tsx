import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LabIA } from './LabIA';

describe('LabIA', () => {
  it('renderiza o case study institucional sem link de codigo', () => {
    render(<LabIA />);

    expect(screen.getByText(/LangChain/)).toBeInTheDocument();
    expect(screen.getByText(/35%/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
