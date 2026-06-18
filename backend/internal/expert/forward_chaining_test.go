package expert

import (
	"testing"

	"sistem-pakar-jurusan/internal/models"
)

func TestForwardChaining_evaluateCondition(t *testing.T) {
	tests := []struct {
		name      string
		answer    float64
		operator  string
		threshold float64
		want      bool
	}{
		{name: "gte met", answer: 0.75, operator: ">=", threshold: 0.5, want: true},
		{name: "gte not met", answer: 0.25, operator: ">=", threshold: 0.5, want: false},
		{name: "gte boundary", answer: 0.5, operator: ">=", threshold: 0.5, want: true},
		{name: "lte met", answer: 0.25, operator: "<=", threshold: 0.5, want: true},
		{name: "lte not met", answer: 0.75, operator: "<=", threshold: 0.5, want: false},
		{name: "eq met", answer: 0.5, operator: "=", threshold: 0.5, want: true},
		{name: "eq not met", answer: 0.75, operator: "=", threshold: 0.5, want: false},
		{name: "unknown operator falls back to gte", answer: 0.75, operator: "??", threshold: 0.5, want: true},
	}

	fc := NewForwardChaining(nil, nil)
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := fc.evaluateCondition(tt.answer, tt.operator, tt.threshold); got != tt.want {
				t.Errorf("evaluateCondition(%v, %q, %v) = %v, want %v", tt.answer, tt.operator, tt.threshold, got, tt.want)
			}
		})
	}
}

func TestForwardChaining_Run(t *testing.T) {
	rules := []models.Rule{
		{ID: 1, PertanyaanID: 10, Operator: ">=", NilaiKondisi: 0.5, JurusanID: 100, CFRule: 0.8},
		{ID: 2, PertanyaanID: 11, Operator: "<=", NilaiKondisi: 0.5, JurusanID: 200, CFRule: 0.6},
		{ID: 3, PertanyaanID: 12, Operator: ">=", NilaiKondisi: 0.5, JurusanID: 300, CFRule: 0.4}, // no answer -> skipped
	}

	t.Run("fires only matching rules with answers", func(t *testing.T) {
		answers := []models.JawabanInput{
			{PertanyaanID: 10, Nilai: 1.0},  // fires rule 1
			{PertanyaanID: 11, Nilai: 0.25}, // fires rule 2 (<=)
		}
		fc := NewForwardChaining(rules, answers)
		got := fc.Run()

		if len(got) != 2 {
			t.Fatalf("Run() fired %d rules, want 2", len(got))
		}
	})

	t.Run("computes CFResult as evidence times rule CF", func(t *testing.T) {
		answers := []models.JawabanInput{
			{PertanyaanID: 10, Nilai: 0.75}, // 0.75 * 0.8 = 0.6
		}
		fc := NewForwardChaining(rules, answers)
		got := fc.Run()

		if len(got) != 1 {
			t.Fatalf("Run() fired %d rules, want 1", len(got))
		}
		if !almostEqual(got[0].CFResult, 0.6) {
			t.Errorf("CFResult = %v, want 0.6", got[0].CFResult)
		}
		if got[0].JurusanID != 100 {
			t.Errorf("JurusanID = %d, want 100", got[0].JurusanID)
		}
	})

	t.Run("skips rules whose condition is not met", func(t *testing.T) {
		answers := []models.JawabanInput{
			{PertanyaanID: 10, Nilai: 0.25}, // 0.25 < 0.5 -> not met
		}
		fc := NewForwardChaining(rules, answers)
		if got := fc.Run(); len(got) != 0 {
			t.Fatalf("Run() fired %d rules, want 0", len(got))
		}
	})

	t.Run("empty answers fire nothing", func(t *testing.T) {
		fc := NewForwardChaining(rules, nil)
		if got := fc.Run(); len(got) != 0 {
			t.Fatalf("Run() fired %d rules, want 0", len(got))
		}
	})
}
