// Shared functions for all tools
function showFormula(description, formula) {
  const formulaBox = document.createElement('div');
  formulaBox.className = 'formula-box';
  formulaBox.innerHTML = `
    <strong>${description}:</strong><br>
    <code>${formula}</code>
  `;
  return formulaBox;
}

// Example usage in tool pages:
// document.body.appendChild(showFormula("Percentage", "B = (A × percentage) / 100"));