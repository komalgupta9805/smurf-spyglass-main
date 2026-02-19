import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const LlamaChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm Llama, your network intelligence assistant. I can help you understand network patterns, identify suspicious entities, or explain risk scores. How can I assist you today?",
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Simulate Llama response
        setTimeout(() => {
            const responses = [
                "Based on the structural analysis, Account ACC-772 seems to be a high-risk aggregator (Fan-In Hub) with multiple suspicious sources.",
                "The circular layout of the transaction graph highlights the proximity of accounts in Ring-C, which shows clear layering behavior.",
                "I've analyzed the recent transaction velocity. There's a 40% spike in fund flow between 2 AM and 4 AM, which is often a sign of automated smurfing.",
                "To export this session as a PDF, just click the Download button on the Report page. It will capture all current intelligence metrics.",
                "The patterns I detected suggest a 'Circular Smurfing' pipeline. You might want to focus on the ring cluster at the center of the network graph.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: randomResponse,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
            setIsLoading(false);
        }, 1500);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl hover:scale-105 transition-all p-0 flex items-center justify-center bg-primary text-primary-foreground group"
            >
                <MessageSquare className="w-6 h-6 group-hover:hidden" />
                <Sparkles className="w-6 h-6 hidden group-hover:block animate-pulse" />
            </Button>
        );
    }

    return (
        <Card className={`fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl border-primary/20 flex flex-col transition-all overflow-hidden z-50 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="bg-primary p-3 flex items-center justify-between text-primary-foreground shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1 rounded-md">
                        <Bot size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold leading-none">Llama Intelligence</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] opacity-80">AI Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/10 text-primary-foreground"
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                    >
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/10 text-primary-foreground"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <ScrollArea className="flex-1 p-4 bg-muted/30" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-card text-card-foreground rounded-tl-none border'
                                        }`}>
                                        {msg.content}
                                        <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'opacity-70 text-right' : 'text-muted-foreground'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-3 border-t bg-background">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ask Llama anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="text-xs focus-visible:ring-primary shadow-inner"
                            />
                            <Button size="sm" onClick={handleSend} disabled={isLoading || !input.trim()} className="shrink-0 h-9 w-9 p-0">
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            </Button>
                        </div>
                        <p className="text-[9px] text-muted-foreground text-center mt-2 uppercase tracking-tighter">
                            Powered by Llama-3-Spyglass-70B
                        </p>
                    </div>
                </>
            )}
        </Card>
    );
};

export default LlamaChatbot;
