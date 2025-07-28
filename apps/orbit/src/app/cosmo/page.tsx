"use client";
import { useState } from "react";
import { Button } from "../../components/ui/button";

// TODO: Integrate real Cosmo SDK
export default function CosmoPage() {
  const [messages, setMessages] = useState<{from: string, text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    setMessages(msgs => [...msgs, { from: "user", text: input }]);
    // TODO: Call Cosmo SDK
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: "cosmo", text: "This is a placeholder response from Cosmo." }]);
      setLoading(false);
    }, 1000);
    setInput("");
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cosmo AI Assistant</h1>
      <div className="border rounded bg-muted p-4 h-96 overflow-y-auto flex flex-col gap-2 mb-4">
        {messages.length === 0 && <div className="text-muted-foreground">Start a conversation with Cosmo...</div>}
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
            <span className={m.from === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"} style={{ borderRadius: 8, padding: 8, display: "inline-block", maxWidth: "80%" }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
      </div>
    </main>
  );
}
