"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getPrograms, Program } from "../../../services/programservices";
import { createRegistration } from "../../../services/registrationservices";

export default function ProgramsPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrograms = async () => {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load programs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [router]);

  const handleSelectProgram = async (
    programId: number
  ) => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setSelecting(programId);

      await createRegistration(
        programId,
        token
      );

      router.push("/dashboard/payment");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to select program."
      );
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc]">
        <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-slate-600">
          Loading programs...
        </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-10">

      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mb-4 text-sm font-semibold text-blue-400 hover:text-green-900/60"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Choose Your Program
          </h1>

          <p className="mt-2 text-slate-500">
            Select the program you want to register for.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {programs.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              No Programs Available
            </h2>

            <p className="mt-2 text-slate-500">
              There are currently no active programs.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {programs.map((program) => (
              <div
                key={program.id}
                className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-400/10 text-2xl">
                  🎓
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {program.name}
                </h2>

                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {program.description ||
                    "No description available."}
                </p>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Duration
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {program.duration ||
                        "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Registration Fee
                    </span>

                    <span className="text-lg font-bold text-blue-400">
                      {Number(
                        program.fee
                      ).toLocaleString()}{" "}
                      ETB
                    </span>
                  </div>

                </div>

                <button
                  onClick={() =>
                    handleSelectProgram(
                      program.id
                    )
                  }
                  disabled={
                    selecting === program.id
                  }
                  className="mt-6 w-full rounded-xl bg-blue-400 px-4 py-3 font-bold text-white transition hover:bg-green-900/60 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selecting === program.id
                    ? "Selecting..."
                    : "Select Program"}
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
      </div>
    </main>
  );
}