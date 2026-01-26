"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
}

export function ScrollReveal({ 
    children, 
    delay = 0, 
    direction = 'up',
    className = ""
}: ScrollRevealProps) {
    
    const directionOffset = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 },
    };

    return (
        <motion.div
            initial={{ 
                opacity: 0,
                ...directionOffset[direction]
            }}
            whileInView={{ 
                opacity: 1,
                y: 0,
                x: 0
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.25, 0.4, 0.25, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface StaggerContainerProps {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}

export function StaggerContainer({ 
    children, 
    staggerDelay = 0.1,
    className = ""
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.25, 0.4, 0.25, 1]
                    }
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
