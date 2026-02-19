# Smart Bookmark App

A fullstack bookmark management application built using Next.js and Supabase.  
Users can securely log in using Google authentication and manage their personal bookmarks.

---

## 🚀 Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Authentication + PostgreSQL Database)
- Vercel (Deployment)

---

## 🔐 Authentication & User Privacy

- Google OAuth authentication via Supabase
- Each bookmark is stored with a unique `user_id`
- Row Level Security (RLS) ensures users can only access their own bookmarks

---

## 🧠 Challenges Faced

- Handling TypeScript type errors during production build
- Fixing authentication redirect issues from localhost to production
- Configuring Supabase Site URL & Redirect URLs correctly

---

## 🌍 Live Demo

https://smart-bookmark-one-omega.vercel.app