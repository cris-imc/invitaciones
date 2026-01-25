"use client";

interface FinalMessageProps {
    texto: string;
    colorPrimario?: string;
}

export function FinalMessage({
    texto,
    colorPrimario = "#000000",
}: FinalMessageProps) {
    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-3xl mx-auto text-center">
                <h3 
                    className="text-4xl md:text-5xl font-bold"
                    style={{ color: colorPrimario }}
                    dangerouslySetInnerHTML={{ __html: texto }}
                />
            </div>
        </section>
    );
}
