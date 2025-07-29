"use client";
import { useEffect, useState } from "react";
import { getTicket, analyzeTicket } from "../../../lib/api";
import type { Ticket } from "../page";

interface TicketUpdate {
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}
import { Button } from "../../../components/ui/button";
import { useParams, useRouter } from "next/navigation";

export default function TicketDetailPage() {
  const { ticketId } = useParams() as { ticketId: string };
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [updates, setUpdates] = useState<TicketUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "demo-token" : "";

  useEffect(() => {
    setLoading(true);
    getTicket(token, ticketId)
      .then(res => {
        if (res.success) {
          setTicket(res.ticket);
          setUpdates(res.updates || []);
        } else {
          setError(res.error || "Failed to load ticket");
        }
      })
      .catch(() => setError("Failed to load ticket"))
      .finally(() => setLoading(false));

    analyzeTicket(token, ticketId)
      .then(res => {
        if (res.success && res.analysis?.knowledgeBaseRecommendations) {
          setSuggestions(res.analysis.knowledgeBaseRecommendations);
        }
      })
      .catch(() => {});
  }, [ticketId, token]);

  if (loading) return <div className="p-8 text-center">Loading ticket...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!ticket) return <div className="p-8 text-center">Ticket not found.</div>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">Back</Button>
      <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
      <div className="mb-4 text-muted-foreground">{ticket.ticketId} &bull; {ticket.status} &bull; {ticket.priority}</div>
      <div className="mb-4">{ticket.description}</div>
      <div className="mb-4">
        <span className="font-semibold">Category:</span> {ticket.category}
        {ticket.subcategory && <span> / {ticket.subcategory}</span>}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Created:</span> {new Date(ticket.createdAt).toLocaleString()}<br />
        <span className="font-semibold">Updated:</span> {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "-"}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Assignee:</span> {ticket.assignedTo?.name || <span className="text-muted-foreground">Unassigned</span>}
      </div>
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Cosmo Suggestions</h2>
          <ul className="list-disc pl-4 space-y-1">
            {suggestions.map((s, i) => (
              <li key={i}>
                <a href={`/knowledge/${s.kbId}`} className="text-primary underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h2 className="font-semibold mt-8 mb-2">Updates</h2>
      <ul className="space-y-2">
        {updates.length === 0 && <li className="text-muted-foreground">No updates yet.</li>}
        {updates.map((u, i) => (
          <li key={i} className="border rounded p-2 bg-muted">
            <div className="text-xs text-muted-foreground mb-1">{u.timestamp && new Date(u.timestamp).toLocaleString()} &bull; {u.user}</div>
            <div className="font-semibold">{u.action}</div>
            <div>{u.details}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
