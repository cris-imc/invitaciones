"use client";

import { useState } from "react";
import { Check, Search, Filter, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TEMPLATES_CONFIG, CATEGORY_LABELS } from "@/lib/templatesConfig";

interface TemplateSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const selectedTemplate = TEMPLATES_CONFIG.find(t => t.id === value) || TEMPLATES_CONFIG[0];

    const filteredTemplates = TEMPLATES_CONFIG.filter(template => {
        const matchesSearch = template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(TEMPLATES_CONFIG.map(t => t.category)));

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Diseño Seleccionado</label>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            Explorar Galería ({TEMPLATES_CONFIG.length})
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                        <div className="p-6 border-b space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Galería de Diseños</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o estilo..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    <Button
                                        variant={selectedCategory === null ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(null)}
                                        className="whitespace-nowrap"
                                    >
                                        Todos
                                    </Button>
                                    {categories.map(cat => (
                                        <Button
                                            key={cat}
                                            variant={selectedCategory === cat ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedCategory(cat)}
                                            className="whitespace-nowrap"
                                        >
                                            {CATEGORY_LABELS[cat]}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelect(template.id)}
                                        className={cn(
                                            "group relative flex flex-col text-left rounded-xl border-2 transition-all overflow-hidden bg-white hover:border-primary/50 hover:shadow-lg",
                                            value === template.id ? "border-primary shadow-md ring-2 ring-primary/20" : "border-transparent shadow-sm"
                                        )}
                                    >
                                        {/* Color Pattern Preview */}
                                        <div className="h-32 w-full relative">
                                            <div className="absolute inset-0 flex">
                                                {template.colors.map((color, i) => (
                                                    <div key={i} style={{ backgroundColor: color }} className="flex-1 h-full" />
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                                                <div className="bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-2xl">
                                                    {template.icon}
                                                </div>
                                            </div>
                                            {value === template.id && (
                                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <span className="font-bold text-lg">{template.label}</span>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {CATEGORY_LABELS[template.category].split('&')[0].trim()}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {template.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {filteredTemplates.length === 0 && (
                                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                                    <Search className="w-8 h-8 mb-2 opacity-20" />
                                    <p>No se encontraron diseños con esos filtros.</p>
                                    <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                                        Limpiar filtros
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Selection Preview Card */}
            <div className="flex items-center gap-4 p-4 border rounded-xl bg-slate-50/50">
                <div className="h-16 w-16 rounded-lg flex items-center justify-center bg-white border shadow-sm text-3xl shrink-0">
                    {selectedTemplate.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{selectedTemplate.label}</h4>
                    <p className="text-xs text-muted-foreground truncate">{selectedTemplate.description}</p>
                    <div className="flex gap-1 mt-2">
                        {selectedTemplate.colors.map((c, i) => (
                            <div key={i} className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
