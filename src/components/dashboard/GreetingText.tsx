"use client";

import { useState, useEffect } from "react";
import { Hand } from "lucide-react";

export function GreetingText({ userName }: { userName: string }) {
    const text = `Hola, ${userName}`;
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (displayText.length < text.length) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length + 1));
            }, 80);
        } else {
            timeout = setTimeout(() => {
                setDisplayText("");
            }, 10000); // 10 segundos de pausa, no es constante
        }
        return () => clearTimeout(timeout);
    }, [displayText, text]);

    return (
        <>
            <style>{`
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                    60% { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
            <h2 className="m-0 flex items-center gap-2 h-[32px]">
                <span>
                    {displayText}
                    <span 
                        className="border-r-[2px] border-indigo-400 h-[1em] ml-[2px] inline-block align-middle"
                        style={{ animation: "blink 1s step-end infinite" }}
                    ></span>
                    <span className="invisible">{text.slice(displayText.length)}</span>
                </span>
                <span 
                    className="inline-block origin-bottom-right" 
                    style={{ animation: "wave 2.5s infinite" }}
                >
                    <Hand className="w-6 h-6 text-amber-500 fill-amber-500/20" />
                </span>
            </h2>
        </>
    );
}
