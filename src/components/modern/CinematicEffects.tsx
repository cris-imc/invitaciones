import { motion } from "framer-motion";

export function FilmGrainOverlay() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay"
            style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                animation: 'grain 0.5s steps(10) infinite'
            }}
        />
    );
}

export function LetterboxBars() {
    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-16 bg-black z-40" />
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-black z-40" />
        </>
    );
}

export function VintageCountdown({ number }: { number: number }) {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
            <div className="text-[20rem] font-bold text-white/20 font-mono">
                {number}
            </div>
        </motion.div>
    );
}
