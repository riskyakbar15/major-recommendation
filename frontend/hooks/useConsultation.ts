"use client";

import { useState, useCallback } from "react";
import { publicApi } from "@/lib/api";
import { Pertanyaan, Jawaban, ConsultationResponse } from "@/types";

export function useConsultation() {
  const [questions, setQuestions] = useState<Pertanyaan[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ConsultationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.getQuestions();
      setQuestions(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat pertanyaan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const setAnswer = useCallback((pertanyaanId: number, nilai: number) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(pertanyaanId, nilai);
      return newAnswers;
    });
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length],
  );

  const submitConsultation = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      const jawabanArray: Jawaban[] = Array.from(answers.entries()).map(
        ([pertanyaan_id, nilai]) => ({
          pertanyaan_id,
          nilai,
        }),
      );

      const response = await publicApi.submitConsultation(jawabanArray);
      setResult(response.data);
      return response.data;
    } catch (err) {
      setError("Gagal mengirim konsultasi. Silakan coba lagi.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [answers]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers(new Map());
    setResult(null);
    setError(null);
  }, []);

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion
    ? answers.get(currentQuestion.id)
    : undefined;
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isComplete = questions.length > 0 && answers.size === questions.length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return {
    questions,
    currentIndex,
    currentQuestion,
    currentAnswer,
    answers,
    loading,
    submitting,
    result,
    error,
    progress,
    isComplete,
    isLastQuestion,
    isFirstQuestion,
    fetchQuestions,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitConsultation,
    reset,
  };
}
