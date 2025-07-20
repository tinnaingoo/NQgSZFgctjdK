
// Smooth navigation between tools
document.querySelectorAll('.tool-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (window.innerWidth > 768) {
      e.preventDefault();
      const targetId = card.getAttribute('onclick').match(/'([^']+)'/)[1];
      document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Auto-show tool if URL has hash (e.g. from bookmark)
window.addEventListener('load', () => {
  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView();
  }
});



// Value Calculator
  const aInput = document.getElementById("a");
  const bInput = document.getElementById("b");
  const percentOnly = document.getElementById("percentOnly");
  const divideOnly = document.getElementById("divideOnly");
  const percentResult = document.getElementById("percentageResult");
  const divideByResult = document.getElementById("divideByResult");
  const bFromPercent = document.getElementById("bFromPercent");
  const bFromDivide = document.getElementById("bFromDivide");

  function calculateValue() {
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);

    if (!isNaN(a) && !isNaN(b)) {
      percentResult.innerText = `B is ${(b / a * 100).toFixed(2)}% of A.`;
      divideByResult.innerText = `To get B from A, divide A by ${(a / b).toFixed(4)}.`;
    } else {
      percentResult.innerText = "";
      divideByResult.innerText = "";
    }

    const percentOnlyVal = parseFloat(percentOnly.value);
    if (!isNaN(a) && !isNaN(percentOnlyVal)) {
      bFromPercent.innerText = `B = ${((percentOnlyVal / 100) * a).toFixed(4)}`;
    } else {
      bFromPercent.innerText = "";
    }

    const divideOnlyVal = parseFloat(divideOnly.value);
    if (!isNaN(a) && !isNaN(divideOnlyVal) && divideOnlyVal !== 0) {
      bFromDivide.innerText = `B = ${(a / divideOnlyVal).toFixed(4)}`;
    } else {
      bFromDivide.innerText = "";
    }
  }

  [aInput, bInput, percentOnly, divideOnly].forEach(el => el.addEventListener("input", calculateValue));

  // Unit Converter
  const unitValue = document.getElementById("unitValue");
  const fromUnit = document.getElementById("fromUnit");
  const toUnit = document.getElementById("toUnit");
  const unitResult = document.getElementById("unitResult");

  function calculateUnit() {
    const val = parseFloat(unitValue.value);
    if (isNaN(val)) return unitResult.innerText = "";

    const lengthUnits = ["inch", "cm", "mm"];
    const volumeUnits = ["ml", "oz"];
    let result = "";

    if (lengthUnits.includes(fromUnit.value) && lengthUnits.includes(toUnit.value)) {
      const factors = { inch: 1, cm: 2.54, mm: 25.4 };
      result = `${val} ${fromUnit.value} = ${(val * factors[toUnit.value] / factors[fromUnit.value]).toFixed(4)} ${toUnit.value}`;
    } else if (volumeUnits.includes(fromUnit.value) && volumeUnits.includes(toUnit.value)) {
      result = fromUnit.value === "oz"
        ? `${val} oz = ${(val * 29.5735).toFixed(4)} ml`
        : `${val} ml = ${(val / 29.5735).toFixed(4)} oz`;
    } else {
      result = "Incompatible units.";
    }

    unitResult.innerText = result;
  }

  [unitValue, fromUnit, toUnit].forEach(el => el.addEventListener("input", calculateUnit));
  fromUnit.addEventListener("change", calculateUnit);
  toUnit.addEventListener("change", calculateUnit);

  // Basic Calculator
  basicCalcInput.addEventListener("input", () => {
  const expression = basicCalcInput.value;
  try {
    if (/^[0-9+\-*/().\s]+$/.test(expression)) {
      const result = Function(`"use strict"; return (${expression})`)();
      basicCalcResult.innerText = `Result: ${result}`;
    } else {
      basicCalcResult.innerText = "Invalid expression.";
    }
  } catch (e) {
    basicCalcResult.innerText = "Error in calculation.";
  }
});



//Volume Caculator

 function convertToCm(value, unit) {
    const val = parseFloat(value);
    if (isNaN(val)) return NaN;
    switch (unit) {
      case 'inch': return val * 2.54;
      case 'mm': return val / 10;
      default: return val;
    }
  }

  function validateInput(id) {
    const input = document.getElementById(id);
    const value = input.value.trim();
    if (value === '' || isNaN(parseFloat(value))) {
      input.classList.add('error');
      return false;
    } else {
      input.classList.remove('error');
      return true;
    }
  }

  function calculateVolume() {
    const shape = document.querySelector('input[name="shape"]:checked').value;
    let volume = 0;
    let valid = true;

    if (shape === 'truncated') {
      const inputs = ['topLength', 'topWidth', 'bottomLength', 'bottomWidth', 'heightTrunc'];
      valid = inputs.every(validateInput);
      if (!valid) {
        document.getElementById('volumeResult').innerText = 'Please correct highlighted inputs.';
        return;
      }

      const l1 = convertToCm(document.getElementById('topLength').value, document.getElementById('topLengthUnit').value);
      const w1 = convertToCm(document.getElementById('topWidth').value, document.getElementById('topWidthUnit').value);
      const l2 = convertToCm(document.getElementById('bottomLength').value, document.getElementById('bottomLengthUnit').value);
      const w2 = convertToCm(document.getElementById('bottomWidth').value, document.getElementById('bottomWidthUnit').value);
      const h = convertToCm(document.getElementById('heightTrunc').value, document.getElementById('heightTruncUnit').value);

      const A1 = l1 * w1;
      const A2 = l2 * w2;
      volume = (h / 3) * (A1 + A2 + Math.sqrt(A1 * A2));
    } else {
      const inputs = ['topDiameter', 'bottomDiameter', 'heightConical'];
      valid = inputs.every(validateInput);
      if (!valid) {
        document.getElementById('volumeResult').innerText = 'Please correct highlighted inputs.';
        return;
      }

      const d1 = convertToCm(document.getElementById('topDiameter').value, document.getElementById('topDiameterUnit').value);
      const d2 = convertToCm(document.getElementById('bottomDiameter').value, document.getElementById('bottomDiameterUnit').value);
      const h = convertToCm(document.getElementById('heightConical').value, document.getElementById('heightConicalUnit').value);

      const r1 = d1 / 2;
      const r2 = d2 / 2;
      volume = (Math.PI * h / 3) * (r1 * r1 + r1 * r2 + r2 * r2);
    }

    const unit = document.getElementById('volumeUnit').value;
    let output = volume;
    if (unit === 'oz') {
      output = volume / 29.5735;
    }

    document.getElementById('volumeResult').innerText = `Total Volume: ${output.toFixed(3)} ${unit}`;
  }

  document.querySelectorAll('input[name="shape"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('truncatedInputs').style.display = radio.value === 'truncated' ? 'block' : 'none';
      document.getElementById('conicalInputs').style.display = radio.value === 'conical' ? 'block' : 'none';
      document.getElementById('volumeResult').innerText = '';
    });
  });

  function calculateBasic() {
    const input = document.getElementById('basicCalcInput').value;
    try {
      const result = Function('return ' + input)();
      document.getElementById('basicCalcResult').innerText = 'Result: ' + result;
    } catch {
      document.getElementById('basicCalcResult').innerText = 'Invalid expression';
    }
  }