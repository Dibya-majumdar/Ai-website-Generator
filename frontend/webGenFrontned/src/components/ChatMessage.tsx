import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";

export type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md",
          isUser ? "bg-elevated text-foreground" : "bg-primary/15 text-primary",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-elevated text-foreground"
            : "border border-border bg-background/60 text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
