package expert

import (
	"math"
	"testing"

	"sistem-pakar-jurusan/internal/models"
)

const cfEpsilon = 1e-9

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < cfEpsilon
}

func TestCertaintyFactor_combineCFs(t *testing.T) {
	tests := []struct {
		name string
		in   []float64
		want float64
	}{
		{name: "empty returns zero", in: []float64{}, want: 0},
		{name: "single value passthrough", in: []float64{0.42}, want: 0.42},
		{name: "two positive", in: []float64{0.6, 0.4}, want: 0.76},
		{name: "two negative", in: []float64{-0.6, -0.4}, want: -0.76},
		{name: "opposite signs", in: []float64{0.8, -0.5}, want: 0.6},
		{name: "opposite full certainty avoids NaN", in: []float64{1.0, -1.0}, want: 0},
		{name: "three positive stays within range", in: []float64{0.5, 0.5, 0.5}, want: 0.875},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			cf := NewCertaintyFactor(nil)
			got := cf.combineCFs(tt.in)

			if math.IsNaN(got) || math.IsInf(got, 0) {
				t.Fatalf("combineCFs(%v) produced non-finite value: %v", tt.in, got)
			}
			if !almostEqual(got, tt.want) {
				t.Errorf("combineCFs(%v) = %v, want %v", tt.in, got, tt.want)
			}
		})
	}
}

func TestClampCF(t *testing.T) {
	tests := []struct {
		name string
		in   float64
		want float64
	}{
		{name: "above upper bound", in: 1.5, want: 1},
		{name: "below lower bound", in: -1.5, want: -1},
		{name: "within range", in: 0.5, want: 0.5},
		{name: "exact upper bound", in: 1, want: 1},
		{name: "exact lower bound", in: -1, want: -1},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := clampCF(tt.in); !almostEqual(got, tt.want) {
				t.Errorf("clampCF(%v) = %v, want %v", tt.in, got, tt.want)
			}
		})
	}
}

func TestCertaintyFactor_Calculate(t *testing.T) {
	results := []RuleResult{
		{JurusanID: 1, CFResult: 0.6},
		{JurusanID: 1, CFResult: 0.4}, // combined with above -> 0.76
		{JurusanID: 2, CFResult: 0.5},
	}

	cf := NewCertaintyFactor(results)
	got := cf.Calculate()

	if len(got) != 2 {
		t.Fatalf("Calculate() returned %d jurusan, want 2", len(got))
	}

	// Sorted by CF descending: jurusan 1 (0.76) before jurusan 2 (0.5)
	if got[0].JurusanID != 1 {
		t.Errorf("expected jurusan 1 ranked first, got jurusan %d", got[0].JurusanID)
	}
	if !almostEqual(got[0].CFFinal, 0.76) {
		t.Errorf("jurusan 1 CFFinal = %v, want 0.76", got[0].CFFinal)
	}
	if got[0].RulesFired != 2 {
		t.Errorf("jurusan 1 RulesFired = %d, want 2", got[0].RulesFired)
	}
	if got[1].JurusanID != 2 {
		t.Errorf("expected jurusan 2 ranked second, got jurusan %d", got[1].JurusanID)
	}
}

func TestCertaintyFactor_FilterAndRank(t *testing.T) {
	t.Run("filters below threshold", func(t *testing.T) {
		t.Parallel()
		cf := NewCertaintyFactor(nil)
		in := []JurusanCF{
			{JurusanID: 1, CFFinal: 0.9},
			{JurusanID: 2, CFFinal: CFThreshold}, // exactly at threshold -> kept
			{JurusanID: 3, CFFinal: 0.1},         // below threshold -> dropped
		}
		got := cf.FilterAndRank(in)
		if len(got) != 2 {
			t.Fatalf("FilterAndRank kept %d, want 2", len(got))
		}
	})

	t.Run("limits to MaxResults", func(t *testing.T) {
		t.Parallel()
		cf := NewCertaintyFactor(nil)
		in := []JurusanCF{
			{JurusanID: 1, CFFinal: 0.9},
			{JurusanID: 2, CFFinal: 0.8},
			{JurusanID: 3, CFFinal: 0.7},
			{JurusanID: 4, CFFinal: 0.6},
		}
		got := cf.FilterAndRank(in)
		if len(got) != MaxResults {
			t.Fatalf("FilterAndRank returned %d, want %d", len(got), MaxResults)
		}
	})
}

func TestProcessConsultation(t *testing.T) {
	rules := []models.Rule{
		{ID: 1, PertanyaanID: 10, Operator: ">=", NilaiKondisi: 0.5, JurusanID: 100, CFRule: 0.8},
		{ID: 2, PertanyaanID: 11, Operator: ">=", NilaiKondisi: 0.5, JurusanID: 100, CFRule: 0.6},
		{ID: 3, PertanyaanID: 12, Operator: ">=", NilaiKondisi: 0.5, JurusanID: 200, CFRule: 0.2},
	}
	answers := []models.JawabanInput{
		{PertanyaanID: 10, Nilai: 1.0}, // fires rule 1 -> 0.8
		{PertanyaanID: 11, Nilai: 1.0}, // fires rule 2 -> 0.6
		{PertanyaanID: 12, Nilai: 0.5}, // fires rule 3 -> 0.1 (below threshold)
	}

	hasil := ProcessConsultation(rules, answers)

	if len(hasil) != 1 {
		t.Fatalf("ProcessConsultation returned %d results, want 1 (jurusan 200 below threshold)", len(hasil))
	}
	if hasil[0].JurusanID != 100 {
		t.Errorf("top jurusan = %d, want 100", hasil[0].JurusanID)
	}
	if hasil[0].Ranking != 1 {
		t.Errorf("ranking = %d, want 1", hasil[0].Ranking)
	}
	// jurusan 100: combine(0.8, 0.6) = 0.8 + 0.6*(1-0.8) = 0.92
	if !almostEqual(hasil[0].CFFinal, 0.92) {
		t.Errorf("CFFinal = %v, want 0.92", hasil[0].CFFinal)
	}
}
