"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    y: number;
    rotation: number;
    delay: number;
    duration: number;
    size: number;
}

interface ParticleSystemProps {
    type?: 'petals' | 'hearts' | 'stars' | 'confetti';
    count?: number;
    color?: string;
    className?: string;
}

export function ParticleSystem({ 
    type = 'petals', 
    count = 20,
    color = '#ffc0cb',
    className = ""
}: ParticleSystemProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: -10 - Math.random() * 20,
                rotation: Math.random() * 360,
                delay: Math.random() * 5,
                duration: 8 + Math.random() * 6,
                size: 0.5 + Math.random() * 1.5,
            });
        }
        setParticles(newParticles);
    }, [count]);

    const getParticleShape = (particle: Particle) => {
        const baseSize = 20 * particle.size;
        
        switch (type) {
            case 'hearts':
                return (
                    <svg width={baseSize} height={baseSize} viewBox="0 0 32 32" fill={color} opacity="0.6">
                        <path d="M16 28C16 28 4 20 4 12C4 8 7 5 10 5C12 5 14 6 16 8C18 6 20 5 22 5C25 5 28 8 28 12C28 20 16 28 16 28Z" />
                    </svg>
                );
            
            case 'stars':
                return (
                    <svg width={baseSize} height={baseSize} viewBox="0 0 32 32" fill={color} opacity="0.7">
                        <path d="M16 2L20 12L30 12L22 18L25 28L16 22L7 28L10 18L2 12L12 12Z" />
                    </svg>
                );
            
            case 'confetti':
                const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8ed4'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                return (
                    <div 
                        style={{
                            width: baseSize,
                            height: baseSize / 2,
                            backgroundColor: randomColor,
                            opacity: 0.8,
                        }}
                    />
                );
            
            case 'petals':
            default:
                return (
                    <svg width={baseSize} height={baseSize} viewBox="0 0 32 32" fill={color} opacity="0.5">
                        <ellipse cx="16" cy="16" rx="10" ry="15" transform="rotate(30 16 16)" />
                    </svg>
                );
        }
    };

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    initial={{
                        x: `${particle.x}vw`,
                        y: `${particle.y}vh`,
                        rotate: particle.rotation,
                        opacity: 0,
                    }}
                    animate={{
                        y: '110vh',
                        x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
                        rotate: particle.rotation + 360 * 2,
                        opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute"
                >
                    {getParticleShape(particle)}
                </motion.div>
            ))}
        </div>
    );
}
