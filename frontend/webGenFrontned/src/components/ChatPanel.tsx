import { Loader2, SendHorizonal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ChatMessage, { type UiMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  messages: UiMessage[];
  loading: boolean;
  thinking: boolean;
  onSend: (prompt: string) => void;
};

const SUGGESTIONS = ["Create a calculator", "Make it dark mode", "Add a reset button"];

export default function ChatPanel({ messages, loading, thinking, onSend }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const submit = () => {
    const prompt = input.trim();
    if (!prompt || thinking) return;
    onSend(prompt);
    setInput("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="size-4 text-primary" />
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">AI Chat</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">Describe the website you want to build.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}

        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="size-4 animate-spin" />
            AI is working...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask AiWebGen to build or change something..."
            className="max-h-40 min-h-20 resize-none pr-12 font-sans text-sm"
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={submit}
            disabled={thinking || !input.trim()}
          >
            {thinking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
