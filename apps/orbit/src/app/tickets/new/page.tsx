"use client";
import { useEffect, useState } from "react";
import { createTicket, getCategories, TicketCreateData } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

interface Category {
  name: string;
  subcategories?: string[];
}
export default function NewTicketPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<TicketCreateData>({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "demo-token" : "";

  useEffect(() => {
    getCategories(token)
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(() => {});
  }, [token]);

  function handleCategoryChange(cat: string) {
    setForm(f => ({ ...f, category: cat, subcategory: "" }));
    const found = categories.find(c => c.name === cat);
    setSubcategories(found && found.subcategories ? found.subcategories : []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await createTicket(token, form);
      if (res.success) {
        setSuccess(true);
        setForm({ title: "", description: "", category: "", priority: "medium" });
      } else {
        setError(res.error || "Failed to create ticket");
      }
    } catch {
      setError("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a New Ticket</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <Input
          placeholder="Description"
          value={form.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, description: e.target.value }))}
          required
        />
        <Select value={form.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {subcategories.length > 0 && (
          <Select value={form.subcategory || ""} onValueChange={sub => setForm(f => ({ ...f, subcategory: sub }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={form.priority} onValueChange={p => setForm(f => ({ ...f, priority: p as 'low' | 'medium' | 'high' | 'critical' }))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Ticket"}
        </Button>
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
        {success && <div className="text-success text-sm mt-2">Ticket submitted!</div>}
      </form>
    </main>
  );
}
