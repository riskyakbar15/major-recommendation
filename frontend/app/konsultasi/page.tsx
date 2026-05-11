"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
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
    } catch (err) {
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
          <div className="text-red-500 text-6xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchQuestions}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Selamat Datang di Konsultasi Jurusan
            </h1>
            <p className="text-gray-600 mb-8">
              Anda akan menjawab {questions.length} pertanyaan seputar minat dan
              bakat Anda. Jawablah dengan jujur untuk mendapatkan rekomendasi
              jurusan yang paling sesuai.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">
                Panduan Menjawab:
              </h3>
              <ul className="text-left text-sm text-blue-800 space-y-2">
                <li>
                  • <strong>Sangat Tidak Setuju:</strong> Sangat tidak sesuai
                  dengan Anda
                </li>
                <li>
                  • <strong>Tidak Setuju:</strong> Kurang sesuai dengan Anda
                </li>
                <li>
                  • <strong>Netral:</strong> Ragu-ragu atau biasa saja
                </li>
                <li>
                  • <strong>Setuju:</strong> Cukup sesuai dengan Anda
                </li>
                <li>
                  • <strong>Sangat Setuju:</strong> Sangat sesuai dengan Anda
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Kembali
              </Link>
              <button
                onClick={() => setHasStarted(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
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
              className="inline-flex items-center text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
            <span className="text-sm text-gray-600">
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.teks}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {ANSWER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(option.value)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                    currentAnswer === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        currentAnswer === option.value
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {currentAnswer === option.value && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={prevQuestion}
            disabled={isFirstQuestion}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Sebelumnya
          </button>
          <button
            onClick={handleNext}
            disabled={currentAnswer === undefined || submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
        <div className="mt-8 text-center text-sm text-gray-600">
          {answers.size}/{questions.length} pertanyaan terjawab
        </div>
      </div>
    </div>
  );
}
