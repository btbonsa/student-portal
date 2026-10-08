"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import apiRequest from "@/services/apiservices";

export default function CreateProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "MALE",
    date_of_birth: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      await apiRequest("/students/profile", { method: "POST", body: JSON.stringify(form) }, token);
      router.push("/dashboard/programs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-400">Complete Your Profile</h1>
          <p className="mt-2 text-slate-600">Fill in your details to continue.</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5 transition-shadow hover:shadow-xl">

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
              <input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
              <input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-black"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full rounded-lg text-black border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg text-black bg-blue-400 px-4 py-3 font-semibold text-white transition hover:bg-green-900/60 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Continue"}
            </button>

          </form>
        </div>
      </div>
      </div>
    </main>
  );
}
