package expert

import (
	"sistem-pakar-jurusan/internal/models"
)

// ForwardChaining implements the forward chaining inference engine
type ForwardChaining struct {
	rules   []models.Rule
	answers map[int]float64 // pertanyaan_id -> nilai jawaban
}

// NewForwardChaining creates a new forward chaining engine
func NewForwardChaining(rules []models.Rule, answers []models.JawabanInput) *ForwardChaining {
	answerMap := make(map[int]float64)
	for _, a := range answers {
		answerMap[a.PertanyaanID] = a.Nilai
	}

	return &ForwardChaining{
		rules:   rules,
		answers: answerMap,
	}
}

// RuleResult represents the result of firing a rule
type RuleResult struct {
	RuleID     int
	JurusanID  int
	CFEvidence float64 // CF of user's answer
	CFRule     float64 // CF of the rule
	CFResult   float64 // Combined CF = CF_Evidence * CF_Rule
}

// Run executes the forward chaining algorithm
// Returns a slice of fired rules with their calculated CF values
func (fc *ForwardChaining) Run() []RuleResult {
	var results []RuleResult

	for _, rule := range fc.rules {
		// Check if we have an answer for this rule's condition
		answerValue, exists := fc.answers[rule.PertanyaanID]
		if !exists {
			continue
		}

		// Evaluate the condition based on operator
		conditionMet := fc.evaluateCondition(answerValue, rule.Operator, rule.NilaiKondisi)

		if conditionMet {
			// Fire the rule: Calculate CF(H,E) = CF(E) * CF(Rule)
			cfResult := answerValue * rule.CFRule

			results = append(results, RuleResult{
				RuleID:     rule.ID,
				JurusanID:  rule.JurusanID,
				CFEvidence: answerValue,
				CFRule:     rule.CFRule,
				CFResult:   cfResult,
			})
		}
	}

	return results
}

// evaluateCondition checks if the answer meets the rule's condition
func (fc *ForwardChaining) evaluateCondition(answer float64, operator string, threshold float64) bool {
	switch operator {
	case ">=":
		return answer >= threshold
	case "<=":
		return answer <= threshold
	case "=":
		return answer == threshold
	default:
		return answer >= threshold
	}
}
