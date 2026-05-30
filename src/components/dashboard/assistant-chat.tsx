"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Send, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { assistantApi, ownerChatApi } from "@/lib/api";
import type { AssistantConversation, AssistantMessage } from "@/lib/types";
import { cn, getApiError } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function formatTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isOwner = message.role === "owner";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3", isOwner && "flex-row-reverse")}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600">
        {isOwner
          ? <User className="h-4 w-4 text-white" />
          : <pip-mascot pose="wave" size="28" no-shadow="" suppressHydrationWarning />}
      </div>
      <div className={cn("max-w-[72%]", isOwner && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isOwner
              ? "rounded-tr-sm bg-gradient-to-br from-blue-600 to-violet-600 text-white"
              : "rounded-tl-sm bg-muted text-foreground"
          )}
        >
          {message.content.split("\n").map((line, i) => {
            const html = line
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.+?)\*/g, "<em>$1</em>");
            return line === "" ? <br key={i} /> : <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          })}
        </div>
        <p className={cn("mt-1 px-1 text-[11px] text-muted-foreground", isOwner && "text-right")}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

function ConversationItem({
  conv,
  active,
  onSelect,
  onDelete
}: {
  conv: AssistantConversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={onSelect}
      className={cn(
        "group relative mb-1 w-full rounded-xl px-3 py-2.5 text-left transition",
        active
          ? "bg-gradient-to-r from-blue-600/10 to-violet-600/10 ring-1 ring-blue-600/20"
          : "hover:bg-muted"
      )}
    >
      <p className={cn("truncate text-sm font-medium", active ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
        {conv.title || "New conversation"}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/70">{formatTime(conv.updated_at)}</p>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute right-2 top-2.5 hidden rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
        aria-label="Delete conversation"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.button>
  );
}

export function AssistantChat() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["assistant-conversations"],
    queryFn: assistantApi.listConversations
  });

  const { data: activeConv, isLoading: messagesLoading } = useQuery({
    queryKey: ["assistant-conversation", activeId],
    queryFn: () => assistantApi.getConversation(activeId!),
    enabled: Boolean(activeId)
  });

  // Select first conversation on initial load
  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // Sync messages when active conversation is fetched
  useEffect(() => {
    if (activeConv) setMessages(activeConv.messages);
  }, [activeConv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const createConvMutation = useMutation({
    mutationFn: () => assistantApi.createConversation(),
    onSuccess: (conv) => {
      queryClient.setQueryData<AssistantConversation[]>(["assistant-conversations"], (prev = []) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    onError: (e) => toast.error(getApiError(e))
  });

  const deleteConvMutation = useMutation({
    mutationFn: (id: string) => assistantApi.deleteConversation(id),
    onMutate: (id) => {
      queryClient.setQueryData<AssistantConversation[]>(["assistant-conversations"], (prev = []) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          setActiveId(next[0]?.id ?? null);
          setMessages([]);
        }
        return next;
      });
    },
    onError: (e) => {
      toast.error(getApiError(e));
      queryClient.invalidateQueries({ queryKey: ["assistant-conversations"] });
    }
  });

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending || !activeId) return;

    const now = new Date().toISOString();
    const optimisticUser: AssistantMessage = {
      id: `optimistic-user-${now}`,
      conversation_id: activeId,
      role: "owner",
      content: text,
      created_at: now
    };

    setMessages((prev) => [...prev, optimisticUser]);
    setInput("");
    setIsSending(true);

    try {
      const aiReply = await ownerChatApi.send(text);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          conversation_id: activeId,
          role: "assistant",
          content: aiReply.response,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (e) {
      toast.error(getApiError(e));
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setIsSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const activeConvMeta = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="flex shrink-0 flex-col overflow-hidden border-r bg-card"
      >
        <div className="flex w-64 flex-col overflow-hidden" style={{ height: "100%" }}>
        <div className="p-3">
          <Button
            className="w-full gap-2"
            onClick={() => createConvMutation.mutate()}
            disabled={createConvMutation.isPending}
          >
            {createConvMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-4 w-4" />
            )}
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Conversations
          </p>

          {convsLoading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeId}
                  onSelect={() => {
                    if (conv.id !== activeId) {
                      setActiveId(conv.id);
                      setMessages([]);
                    }
                  }}
                  onDelete={() => deleteConvMutation.mutate(conv.id)}
                />
              ))}
            </AnimatePresence>
          )}

          {!convsLoading && conversations.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">No conversations yet. Start a new chat!</p>
          )}
        </div>
        </div>
      </motion.aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <pip-mascot pose="wave" size="36" no-shadow="" suppressHydrationWarning />
          <div>
            <p className="text-sm font-semibold">{activeConvMeta?.title || "New conversation"}</p>
            <p className="text-[11px] text-muted-foreground">SellPilot AI Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {messagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !activeId ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <pip-mascot pose="sleep" size="160" no-shadow="" suppressHydrationWarning />
              <div>
                <h3 className="font-semibold">SellPilot AI Assistant</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Create a new conversation to get started.
                </p>
              </div>
              <Button onClick={() => createConvMutation.mutate()} disabled={createConvMutation.isPending}>
                <MessageSquarePlus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <pip-mascot pose="wave" size="160" speed="0.9" no-shadow="" suppressHydrationWarning />
              <div>
                <h3 className="font-semibold">How can I help you today?</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Ask me anything about your shops, products, orders, or growth strategies.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["How to increase sales?", "Best product categories?", "Fulfillment tips"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="rounded-xl border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isSending && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <pip-mascot pose="think" size="56" no-shadow="" speed="1.2" suppressHydrationWarning />
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t p-4">
          <div className="flex items-end gap-2 rounded-2xl border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={activeId ? "Ask the AI assistant…" : "Create a conversation first"}
              disabled={!activeId || isSending}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              style={{ maxHeight: "7rem" }}
            />
            <Button
              size="icon"
              className="shrink-0"
              onClick={sendMessage}
              disabled={!input.trim() || isSending || !activeId}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
