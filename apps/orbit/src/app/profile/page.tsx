"use client";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { getSession, updateProfile } from "../../lib/api";

export default function ProfilePage() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    org: "",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getSession(token)
      .then(res => {
        if (res.success) {
          setUserId(res.user.id);
          const data = {
            name: res.user.name || '',
            email: res.user.email || '',
            org: res.user.org || ''
          };
          setProfile(data);
          setForm(data);
        }
      })
      .catch(() => {});
  }, [token]);

  function handleEdit() {
    setEditing(true);
    setForm(profile);
  }
  function handleSave() {
    if (!token || !userId) return;
    setError(null);
    updateProfile(token, userId, form)
      .then(() => {
        setProfile(form);
        setEditing(false);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        setError(`Failed to update profile: ${error.message || "Unknown error"}`);
      });
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          {editing ? (
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          ) : (
            <div>{profile.name}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          {editing ? (
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          ) : (
            <div>{profile.email}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Organization</label>
          {editing ? (
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.org}
              onChange={(e) =>
                setForm((f) => ({ ...f, org: e.target.value }))
              }
            />
          ) : (
            <div>{profile.org}</div>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>Edit</Button>
          )}
        </div>
        {error && (
          <div className="text-destructive text-sm" role="alert">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
