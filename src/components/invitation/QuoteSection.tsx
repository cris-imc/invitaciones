"use client";

interface QuoteSectionProps {
    texto: string;
    estilo?: string;
    colorPrimario?: string;
}

export function QuoteSection({
    texto,
    estilo = "elegante",
    colorPrimario = "#000000",
}: QuoteSectionProps) {
    return (
        <section className="py-24 md:py-32 px-6" style={{ backgroundColor: '#f8fafc' }}>
            <div className="max-w-3xl mx-auto text-center">
                <div className="mb-6 w-12 h-px mx-auto" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.3 }} />
                <blockquote 
                    className="text-xl md:text-2xl leading-relaxed"
                    style={{ 
                        color: 'var(--color-text-dark)',
                        fontFamily: "'Parisienne', cursive",
                        fontWeight: '400',
                        lineHeight: '1.6'
                    }}
                >
                    "{texto}"
                </blockquote>
                <div className="mt-6 w-12 h-px mx-auto" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.3 }} />
            </div>
        </section>
    );
}
