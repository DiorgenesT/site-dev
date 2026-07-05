import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renderiza os componentes base da fundacao sem lancar erro', () => {
    render(<App />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();
  });
});
