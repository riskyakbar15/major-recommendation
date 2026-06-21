"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useConsultation } from "@/hooks/useConsultation";
import { ANSWER_OPTIONS } from "@/types";

export default function KonsultasiPage() {
  const router = useRouter();
  const {
    questions,
    currentIndex,
    currentQuestion,
    currentAnswer,
    loading,
    submitting,
    error,
    progress,
    isComplete,
    isLastQuestion,
    isFirstQuestion,
    answers,
    fetchQuestions,
    setAnswer,
    nextQuestion,
    prevQuestion,
    submitConsultation,
  } = useConsultation();

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswerSelect = (nilai: number) => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, nilai);
    }
  };

  const handleNext = () => {
    if (isLastQuestion && isComplete) {
      handleSubmit();
    } else {
      nextQuestion();
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitConsultation();
      router.push(`/hasil/${result.session_id}`);
    } catch {
      // Error is handled by the hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchQuestions}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto w-full animate-fade-up">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-balance">
              Selamat Datang di Konsultasi Jurusan
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Anda akan menjawab{" "}
              <strong className="text-gray-900">{questions.length}</strong>{" "}
              pertanyaan seputar minat dan bakat Anda. Jawablah dengan jujur
              untuk mendapatkan rekomendasi jurusan yang paling sesuai.
            </p>
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-blue-900 mb-3">
                Panduan Menjawab
              </h2>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  <strong>Sangat Tidak Setuju:</strong> Sangat tidak sesuai
                  dengan Anda
                </li>
                <li>
                  <strong>Tidak Setuju:</strong> Kurang sesuai dengan Anda
                </li>
                <li>
                  <strong>Netral:</strong> Ragu-ragu atau biasa saja
                </li>
                <li>
                  <strong>Setuju:</strong> Cukup sesuai dengan Anda
                </li>
                <li>
                  <strong>Sangat Setuju:</strong> Sangat sesuai dengan Anda
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Kembali
              </Link>
              <button
                type="button"
                onClick={() => setHasStarted(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/25 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Mulai Konsultasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
            <span className="text-sm font-medium text-gray-500">
              Pertanyaan{" "}
              <span className="text-gray-900">{currentIndex + 1}</span> dari{" "}
              {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <progress
            className="progress-native"
            value={Math.round(progress)}
            max={100}
            aria-label="Progres konsultasi"
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div
            key={currentQuestion.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8 animate-fade-up"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 leading-snug">
              {currentQuestion.teks}
            </h2>

            {/* Answer Options */}
            <div
              className="space-y-3"
              role="radiogroup"
              aria-label="Pilihan jawaban"
            >
              {ANSWER_OPTIONS.map((option, index) => {
                const selected = currentAnswer === option.value;
                return (
                  <label
                    key={option.value}
                    className={`group flex items-center w-full p-4 cursor-pointer border-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1 ${
                      selected
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option.value}
                      checked={selected}
                      onChange={() => handleAnswerSelect(option.value)}
                      className="sr-only"
                    />
                    <span
                      className={`w-7 h-7 rounded-full border-2 mr-3 flex items-center justify-center text-xs font-bold transition-colors ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 text-gray-400 group-hover:border-blue-300"
                      }`}
                    >
                      {selected ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span
                      className={`font-medium ${selected ? "text-blue-900" : "text-gray-900"}`}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={prevQuestion}
            disabled={isFirstQuestion}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentAnswer === undefined || submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Mengirim...
              </>
            ) : isLastQuestion && isComplete ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Selesai
              </>
            ) : (
              <>
                Selanjutnya
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Question Status */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{answers.size}</span>/
          {questions.length} pertanyaan terjawab
        </div>
      </div>
    </div>
  );
}
