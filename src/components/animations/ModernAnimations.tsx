import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInUpProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export function FadeInUp({ children, delay = 0, className = "" }: FadeInUpProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface StaggerChildrenProps {
    children: React.ReactNode;
    staggerDelay?: number;
    className?: string;
}

export function StaggerChildren({ children, staggerDelay = 0.1, className = "" }: StaggerChildrenProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export const fadeInUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

interface ScaleOnHoverProps {
    children: React.ReactNode;
    scale?: number;
    className?: string;
}

export function ScaleOnHover({ children, scale = 1.05, className = "" }: ScaleOnHoverProps) {
    return (
        <motion.div
            whileHover={{ scale }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
