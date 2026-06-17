package expert

import (
	"sort"

	"sistem-pakar-jurusan/internal/models"
)

const (
	// CFThreshold is the minimum CF value to be considered as a valid recommendation
	CFThreshold = 0.3
	// MaxResults is the maximum number of recommendations to return
	MaxResults = 3
)

// CertaintyFactor handles CF calculations and combinations
type CertaintyFactor struct {
	ruleResults []RuleResult
}

// JurusanCF represents the final CF for a jurusan
type JurusanCF struct {
	JurusanID int
	CFFinal   float64
	RulesFired int
}

// NewCertaintyFactor creates a new certainty factor calculator
func NewCertaintyFactor(results []RuleResult) *CertaintyFactor {
	return &CertaintyFactor{
		ruleResults: results,
	}
}

// Calculate computes the combined CF for each jurusan
// Using the combination formula: CF_combined = CF_old + CF_new * (1 - CF_old)
func (cf *CertaintyFactor) Calculate() []JurusanCF {
	// Group results by jurusan
	jurusanCFs := make(map[int][]float64)
	
	for _, result := range cf.ruleResults {
		jurusanCFs[result.JurusanID] = append(jurusanCFs[result.JurusanID], result.CFResult)
	}

	// Calculate combined CF for each jurusan
	var results []JurusanCF

	for jurusanID, cfValues := range jurusanCFs {
		combinedCF := cf.combineCFs(cfValues)
		
		results = append(results, JurusanCF{
			JurusanID:  jurusanID,
			CFFinal:    combinedCF,
			RulesFired: len(cfValues),
		})
	}

	// Sort by CF descending
	sort.Slice(results, func(i, j int) bool {
		return results[i].CFFinal > results[j].CFFinal
	})

	return results
}

// combineCFs combines multiple CF values using the standard CF combination formula
// For positive CFs: CF_combined = CF1 + CF2 * (1 - CF1)
func (cf *CertaintyFactor) combineCFs(cfValues []float64) float64 {
	if len(cfValues) == 0 {
		return 0
	}

	if len(cfValues) == 1 {
		return cfValues[0]
	}

	// Start with the first CF value
	combined := cfValues[0]

	// Combine with each subsequent CF
	for i := 1; i < len(cfValues); i++ {
		cfNew := cfValues[i]

		if combined >= 0 && cfNew >= 0 {
			// Both positive: CF_combined = CF_old + CF_new * (1 - CF_old)
			combined = combined + cfNew*(1-combined)
		} else if combined < 0 && cfNew < 0 {
			// Both negative: CF_combined = CF_old + CF_new * (1 + CF_old)
			combined = combined + cfNew*(1+combined)
		} else {
			// One positive, one negative: CF_combined = (CF_old + CF_new) / (1 - min(|CF_old|, |CF_new|))
			minAbs := abs(combined)
			if abs(cfNew) < minAbs {
				minAbs = abs(cfNew)
			}
			denom := 1 - minAbs
			if denom == 0 {
				// Opposing evidences of full certainty cancel out; avoid Inf/NaN.
				combined = 0
			} else {
				combined = (combined + cfNew) / denom
			}
		}
	}

	return clampCF(combined)
}

// clampCF constrains a combined CF to the valid [-1, 1] range.
func clampCF(cf float64) float64 {
	if cf > 1 {
		return 1
	}
	if cf < -1 {
		return -1
	}
	return cf
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}

// FilterAndRank filters results by threshold and returns top N
func (cf *CertaintyFactor) FilterAndRank(results []JurusanCF) []JurusanCF {
	// Filter by threshold
	var filtered []JurusanCF
	for _, r := range results {
		if r.CFFinal >= CFThreshold {
			filtered = append(filtered, r)
		}
	}

	// Limit to MaxResults
	if len(filtered) > MaxResults {
		filtered = filtered[:MaxResults]
	}

	return filtered
}

// ProcessConsultation is the main entry point for processing a consultation
// It runs forward chaining, calculates combined CFs, and returns top recommendations
func ProcessConsultation(rules []models.Rule, answers []models.JawabanInput) []models.Hasil {
	// Step 1: Run forward chaining to fire matching rules
	fc := NewForwardChaining(rules, answers)
	ruleResults := fc.Run()

	// Step 2: Calculate combined CF for each jurusan
	cfCalc := NewCertaintyFactor(ruleResults)
	jurusanCFs := cfCalc.Calculate()

	// Step 3: Filter by threshold and get top results
	topResults := cfCalc.FilterAndRank(jurusanCFs)

	// Step 4: Convert to Hasil model
	var hasil []models.Hasil
	for i, r := range topResults {
		hasil = append(hasil, models.Hasil{
			JurusanID: r.JurusanID,
			CFFinal:   r.CFFinal,
			Ranking:   i + 1,
		})
	}

	return hasil
}
