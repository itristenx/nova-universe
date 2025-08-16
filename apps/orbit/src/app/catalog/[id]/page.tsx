"use client";
import { useEffect, useState } from "react";
import { getCatalogItems, submitCatalogItem } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

export default function _CatalogItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [schema, setSchema] = useState<any>(null);
  const [values, setValues] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCatalogItems("demo-token")
      .then(res => {
        const item = res.items.find((i: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => i.id === parseInt(params.id));
        if (item) {
          setSchema(item.form_schema || { fields: [] });
        } else {
          setError("Item not found");
        }
      })
      .catch(() => setError("Failed to load item"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submitCatalogItem("demo-token", parseInt(params.id), { values }); // TODO-LINT: move to async function
    if (res.success) {
      router.push("/catalog");
    } else {
      setError(res.error || "Submission failed");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-destructive">{error}</div>;

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Request Item</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {schema?.fields?.map((f: FormField) => (
          <input
            key={f.name}
            className="border p-2 w-full"
            placeholder={f.label || f.name}
            value={values[f.name] || ""}
            onChange={e => setValues({ ...values, [f.name]: e.target.value })}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </main>
  );
}
