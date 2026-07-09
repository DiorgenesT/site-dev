const LINK_WHATSAPP =
  'https://wa.me/5531991519864?text=Ol%C3%A1%2C%20vim%20pelo%20seu%20portf%C3%B3lio%21';

export function Contato() {
  return (
    <section
      id="contato"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8"
    >
      <h2 className="text-2xl">Vamos conversar?</h2>
      <a
        href={LINK_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-vermelho-punk text-branco-papel px-6 py-3 uppercase tracking-widest"
      >
        Fale comigo
      </a>
    </section>
  );
}
