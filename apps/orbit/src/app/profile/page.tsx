"use client";
import { useState } from "react";
import { Button } from "../../components/ui/button";

// TODO: Replace with real user profile API
export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane@example.com",
    org: "Nova Corp",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  function handleEdit() {
    setEditing(true);
    setForm(profile);
  }
  function handleSave() {
    setProfile(form);
    setEditing(false);
    // TODO: Save to API
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
      </div>
    </main>
  );
}
