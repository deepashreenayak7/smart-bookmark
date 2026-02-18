"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================
  // GET USER
  // =========================
  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) console.log("Auth error:", error.message);

    setUser(user);

    if (user) fetchBookmarks(user.id);
  };

  // =========================
  // FETCH BOOKMARKS
  // =========================
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error.message);
      return;
    }

    setBookmarks(data || []);
  };

  // =========================
  // ADD BOOKMARK
  // =========================
  const addBookmark = async () => {
    if (!url || !title) return alert("Enter title + url");

    if (!user) return alert("Login first");

    setLoading(true);

    const { error } = await supabase.from("bookmarks").insert([
      {
        url,
        title,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      console.log("Insert error:", error.message);
      alert(error.message);
      return;
    }

    setUrl("");
    setTitle("");
    fetchBookmarks(user.id);
  };

  // =========================
  // DELETE BOOKMARK (FIXED)
  // =========================
  const deleteBookmark = async (id: string) => {
    setDeletingId(id);

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id); // ← IMPORTANT: NO .select()

    setDeletingId(null);

    if (error) {
      console.log("Delete error:", error.message);
      alert(error.message);
      return;
    }

    fetchBookmarks(user.id);
  };

  // =========================
  // LOGIN
  // =========================
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  // =========================
  // INITIAL LOAD + REALTIME
  // =========================
  useEffect(() => {
    getUser();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) fetchBookmarks(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =========================
  // LOGIN SCREEN
  // =========================
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={login}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Login with Google
        </button>
      </div>
    );

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Smart Bookmarks</h1>

        <button
          onClick={logout}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ADD BOOKMARK */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-3 w-full rounded"
        />

        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-3 w-full rounded"
        />

        <button
          onClick={addBookmark}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded w-full"
        >
          {loading ? "Adding..." : "Add Bookmark"}
        </button>
      </div>

      {/* BOOKMARK LIST */}
      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500">No bookmarks yet 🚀</p>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{bookmark.title}</h2>

                <a
                  href={bookmark.url}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {bookmark.url}
                </a>
              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {deletingId === bookmark.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
