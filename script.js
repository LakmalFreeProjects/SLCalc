// Fetch USD to LKR rate from Wise API
async function fetchLKRRate() {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    ); // Use a reliable API endpoint
    const data = await response.json();
    const lkrRate = data.rates.LKR;
    document.getElementById("lkrRate").value = lkrRate; // Set the rate in the input field
    convertToLKR();
  } catch (error) {
    console.error("Error fetching USD to LKR rate:", error);
  }
}

function calculateAPIT(taxableIncome) {
  let apit = 0;

  if (taxableIncome > 308333) {
    apit = taxableIncome * 0.36 - 73500;
  } else if (taxableIncome > 266667) {
    apit = taxableIncome * 0.3 - 55000;
  } else if (taxableIncome > 225000) {
    apit = taxableIncome * 0.24 - 39000;
  } else if (taxableIncome > 183333) {
    apit = taxableIncome * 0.18 - 25500;
  } else if (taxableIncome > 141667) {
    apit = taxableIncome * 0.12 - 14500;
  } else if (taxableIncome > 100000) {
    apit = taxableIncome * 0.06 - 6000;
  }

  return apit;
}

// Convert USD to LKR
function convertToLKR() {
  const usdAmount = parseFloat(document.getElementById("usdAmount").value);
  const lkrRate = parseFloat(document.getElementById("lkrRate").value);
  if (usdAmount && lkrRate) {
    const lkrAmount = usdAmount * lkrRate;
    document.getElementById("companyCost").value = lkrAmount.toFixed(2); // Display calculated LKR amount in company cost
  }
}

// Function to calculate forward values (like EPF, ETF, etc.)
function calculate() {
  let allowances = 0;
  let taxableAllowance = 0;
  let basicSalary = parseFloat(document.getElementById("basicSalary").value) || 0;
  document.querySelectorAll(".allowance").forEach(function (allowanceInput) {
    let allowanceValue = parseFloat(allowanceInput.value) || 0;
    const isTaxable = allowanceInput.dataset.taxable === "true";

    allowances += allowanceValue;
    if (isTaxable) {
      taxableAllowance += allowanceValue;
    }
  });
  let grossSalary = basicSalary + allowances;

  const taxableIncome = basicSalary + taxableAllowance;
  // Calculate deductions, APIT, etc.
  const epfEmployee = basicSalary * 0.08;
  const epfEmployer = basicSalary * 0.12;
  const etfEmployer = basicSalary * 0.03;

  // APIT Placeholder (use actual tax rates as needed)

  const apit = calculateAPIT(taxableIncome);
  const totalDeductions = parseFloat(epfEmployee) + apit;
  const netSalary = grossSalary - totalDeductions;
  const totalCostLkr = grossSalary + epfEmployer + etfEmployer;
  // Display results
  const resultsTable = `
    <table>
    <tr><th>Base Salary</th><td>${basicSalary.toFixed(2)}</td></tr>
      <tr><th>Gross Salary</th><td>${grossSalary.toFixed(2)}</td></tr>
      <tr><th>EPF (Employee)</th><td>${epfEmployee.toFixed(2)}</td></tr>
      <tr><th>EPF (Employer)</th><td>${epfEmployer.toFixed(2)}</td></tr>
      <tr><th>ETF (Employer)</th><td>${etfEmployer.toFixed(2)}</td></tr>
      <tr><th>APIT</th><td>${apit.toFixed(2)}</td></tr>
      <tr><th>Net Salary</th><td>${netSalary.toFixed(2)}</td></tr>
      <tr><th>Company Cost</th><td>${totalCostLkr.toFixed(2)}</td></tr>
    </table>
  `;
  document.getElementById("results").innerHTML = resultsTable;
}

// Function to reverse calculate the company cost
function reverseCalculate() {
  const companyCost = parseFloat(document.getElementById("companyCost").value);
  const usdAmount = parseFloat(document.getElementById("usdAmount").value);
  const lkrRate = parseFloat(document.getElementById("lkrRate").value);

  // Calculate reverse cost breakdown
  const lkrFromUsd = usdAmount * lkrRate;
  const baseSalary = companyCost / 1.15;

  // Assuming company cost includes EPF, ETF, and APIT
  const epfEmployee = baseSalary * 0.08;
  const epfEmployer = baseSalary * 0.12;
  const etfEmployer = baseSalary * 0.03;
  const apit = calculateAPIT(baseSalary);

  const grossSalary = baseSalary; // Back-calculate gross salary
  const netSalary = grossSalary - apit - epfEmployee;
  // Display reverse results
  const reverseResultsTable = `
    <table>
    <tr><th>Base Salary</th><td>${grossSalary.toFixed(2)}</td></tr>
      <tr><th>Gross Salary</th><td>${grossSalary.toFixed(2)}</td></tr>
      <tr><th>EPF (Employee)</th><td>${epfEmployee.toFixed(2)}</td></tr>
      <tr><th>EPF (Employer)</th><td>${epfEmployer.toFixed(2)}</td></tr>
      <tr><th>ETF (Employer)</th><td>${etfEmployer.toFixed(2)}</td></tr>
      <tr><th>APIT</th><td>${apit.toFixed(2)}</td></tr>
       <tr><th>Net Salary</th><td>${netSalary.toFixed(2)}</td></tr>
      <tr><th>Company Cost</th><td>${companyCost.toFixed(2)}</td></tr>
    </table>
  `;
  document.getElementById("results").innerHTML = reverseResultsTable;
  const results = {
    "Base Salary": 100.0,
    "Gross Salary": 200.0,
    "EPF (Employee)": 8.0,
    "EPF (Employer)": 12.0,
    "ETF (Employer)": 3.0,
    APIT: 0.0,
    "Net Salary": 192.0,
    "Company Cost": 215.0
  };

  displayResults(results);
}
// Function to add an allowance input
function addAllowance(allowance = 0, taxable = false) {
  const allowancesSection = document.getElementById("allowances-section");
  const allowanceGroup = document.createElement("div");
  allowanceGroup.className = "allowance-group";

  // Allowance input
  const allowanceInput = document.createElement("input");
  allowanceInput.type = "number";
  allowanceInput.className = "allowance";
  allowanceInput.placeholder = "Enter Allowance";
  allowanceInput.dataset.taxable = "false";
  allowanceInput.value = allowance;

  // Taxable checkbox
  const taxableLabel = document.createElement("label");
  taxableLabel.textContent = "Taxable";
  const taxableCheckbox = document.createElement("input");
  taxableCheckbox.type = "checkbox";
  taxableCheckbox.className = "taxable-checkbox";
  if(taxable){
    taxableCheckbox.checked = true;
    allowanceInput.dataset.taxable = "true";
  }
  taxableCheckbox.addEventListener("change", function () {
    allowanceInput.dataset.taxable = this.checked ? "true" : "false";
  });

  // Remove button
  const removeButton = document.createElement("button");
  removeButton.className = "btn-remove";
  removeButton.textContent = "Remove";
  removeButton.onclick = () => allowanceGroup.remove();

  // Append elements
  allowanceGroup.appendChild(allowanceInput);
  allowanceGroup.appendChild(taxableLabel);
  allowanceGroup.appendChild(taxableCheckbox);
  allowanceGroup.appendChild(removeButton);
  allowancesSection.appendChild(allowanceGroup);
}

function displayResults(results) {
  //const resultsContent = document.getElementById("results-content");
  //resultsContent.innerHTML = ""; // Clear previous results

  // Create tiles for each result
  for (const [key, value] of Object.entries(results)) {
    const tile = document.createElement("div");
    tile.className = "bg-white p-4 rounded-lg shadow-md border border-gray-200";
    tile.innerHTML = `
            <h4 class="font-semibold">${key}</h4>
            <p class="text-lg">${value.toFixed(2)}</p>
        `;
    resultsContent.appendChild(tile);
  }
}

// Function to get query parameters as an object
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const queryObj = {};
  for (const [key, value] of params.entries()) {
      queryObj[key] = value;
  }
  return queryObj;
}

// Function to populate textboxes dynamically
function populateTextboxes() {
  const queryParams = getQueryParams();
      if(queryParams.b!==undefined){
         var basicSalary = document.getElementById("basicSalary");
         basicSalary.value = queryParams.b;
      }
      if(queryParams.a1!==undefined){
        if(queryParams.at1!==undefined && queryParams.at1==="1"){
          addAllowance(queryParams.a1, true);
        } else {
          addAllowance(queryParams.a1, false);
        }
      }
      if(queryParams.a2!==undefined){
        if(queryParams.at2!==undefined && queryParams.at2==="1"){
          addAllowance(queryParams.a2, true);
        } else {
          addAllowance(queryParams.a2, false);
        }
      }
      if(queryParams.a3!==undefined){
        if(queryParams.at3!==undefined && queryParams.at3==="1"){
          addAllowance(queryParams.a3, true);
        } else {
          addAllowance(queryParams.a3, false);
        }
      } 
      if(queryParams.a4!==undefined){
        if(queryParams.at4!==undefined && queryParams.at4==="1"){
          addAllowance(queryParams.a4, true);
        } else {
          addAllowance(queryParams.a4, false);
        }
      }
      if(queryParams.a5!==undefined){
        if(queryParams.at5!==undefined && queryParams.at5==="1"){
          addAllowance(queryParams.a5, true);
        } else {
          addAllowance(queryParams.a5, false);
        }
      }
      calculate();
}

// Call the function on page load
populateTextboxes();