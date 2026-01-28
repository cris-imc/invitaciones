"use client";

import { useState } from "react";
import { Check, Search, Filter, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TEMPLATES_CONFIG, CATEGORY_LABELS } from "@/lib/templatesConfig";

interface TemplateSelectorProps {
    value: string;
    onChange: (value: string) => void;
    eventType?: string;
}

export function TemplateSelector({ value, onChange, eventType }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const selectedTemplate = TEMPLATES_CONFIG.find(t => t.id === value) || TEMPLATES_CONFIG[0];

    const filteredTemplates = TEMPLATES_CONFIG.filter(template => {
        const matchesSearch = template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "ALL" ? true : template.category === selectedCategory;
        
        // Filtrar plantillas infantiles solo para cumpleaños y bautismo
        const isKidsTemplate = template.id === 'KIDS_PARTY' || template.id === 'BABY_BAPTISM';
        const matchesEventType = !isKidsTemplate || eventType === 'CUMPLEANOS' || eventType === 'BAUTISMO';
        
        return matchesSearch && matchesCategory && matchesEventType;
    });

    const categories = Array.from(new Set(TEMPLATES_CONFIG.map(t => t.category)));

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    const getCategoryCount = (cat: string) => {
        return TEMPLATES_CONFIG.filter(t => t.category === cat).length;
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
                    <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                        <div className="p-6 border-b space-y-4 shrink-0">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Galería de Diseños</DialogTitle>
                            </DialogHeader>

                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o estilo..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 pt-4 border-b shrink-0">
                                <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-2 flex-wrap">
                                    <TabsTrigger 
                                        value="ALL" 
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                                    >
                                        Todos ({TEMPLATES_CONFIG.length})
                                    </TabsTrigger>
                                    {categories.map(cat => (
                                        <TabsTrigger 
                                            key={cat} 
                                            value={cat}
                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                                        >
                                            {CATEGORY_LABELS[cat]} ({getCategoryCount(cat)})
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <TabsContent value={selectedCategory} className="flex-1 overflow-y-auto p-6 mt-0 bg-gradient-to-b from-slate-50 to-white data-[state=inactive]:hidden">{filteredTemplates.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">{filteredTemplates.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => handleSelect(template.id)}
                                                className={cn(
                                                    "group relative flex flex-col text-left rounded-xl border-2 transition-all overflow-hidden bg-white hover:border-primary/50 hover:shadow-xl hover:-translate-y-1",
                                                    value === template.id ? "border-primary shadow-lg ring-4 ring-primary/20 scale-[1.02]" : "border-slate-200 shadow-sm"
                                                )}
                                            >
                                                {/* Color Pattern Preview */}
                                                <div className="h-32 w-full relative overflow-hidden">
                                                    <div className="absolute inset-0 flex">
                                                        {template.colors.map((color, i) => (
                                                            <div 
                                                                key={i} 
                                                                style={{ backgroundColor: color }} 
                                                                className="flex-1 h-full transition-transform group-hover:scale-110" 
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/20 to-transparent group-hover:from-black/10 transition-colors">
                                                        <div className="bg-white/95 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center shadow-xl text-3xl group-hover:scale-110 transition-transform">
                                                            {template.icon}
                                                        </div>
                                                    </div>
                                                    {value === template.id && (
                                                        <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1.5 shadow-lg animate-in zoom-in">
                                                            <Check className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4 space-y-2 flex-1 flex flex-col">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="font-bold text-base leading-tight">{template.label}</span>
                                                        <Badge variant="secondary" className="text-[10px] shrink-0">
                                                            {CATEGORY_LABELS[template.category].split('&')[0].trim()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                                        {template.description}
                                                    </p>
                                                    <div className="flex gap-1 pt-2">
                                                        {template.colors.map((c, i) => (
                                                            <div 
                                                                key={i} 
                                                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                                                                style={{ backgroundColor: c }} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                                        <Search className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="text-lg font-medium">No se encontraron diseños</p>
                                        <p className="text-sm mb-4">Intenta con otros filtros o categorías</p>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => { 
                                                setSearchQuery(""); 
                                                setSelectedCategory("ALL"); 
                                            }}
                                        >
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
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
