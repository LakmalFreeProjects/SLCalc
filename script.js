// Fetch USD to LKR rate from Wise API
async function fetchLKRRate() {
  const currency = document.getElementById("currency").value;
  if(currency == "Other") {
   
    return;
  }
  else{
  try {
    let url = "https://api.exchangerate-api.com/v4/latest/" + currency;
    const response = await fetch(
      url
    ); // Use a reliable API endpoint
    const data = await response.json();
    const lkrRate = data.rates.LKR;
    document.getElementById("lkrRate").value = lkrRate; // Set the rate in the input field
    convertToLKR();
  } catch (error) {
    console.error("Error fetching USD to LKR rate:", error);
  }
}
}

function changeDefaultCurrency(){
  document.getElementById("currency").value = document.getElementById("defaultCurrency").value;
  fetchLKRRate();
}
function ToggleSettings(){
  var x = document.getElementById("SettingsDiv");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function calculateAPIT(taxableIncome) {
  let year = document.getElementById("taxLogicYear").value;
  let apit = 0;

  if(year == '2024'){
    if (taxableIncome > 358333) {
      apit = taxableIncome * 0.36 - 94000;
    } else if (taxableIncome > 316666) {
      apit = taxableIncome * 0.30 - 72500;
    } else if (taxableIncome > 275000) {
      apit = taxableIncome * 0.24 - 53500; 
    } else if (taxableIncome > 233333) {
      apit = taxableIncome * 0.18 - 37000; 
    } else if (taxableIncome > 150000) {
      apit = taxableIncome * 0.06 - 9000;
    }
  }
  else {
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

function updatePeggedAllowance(){

  var lkrFromUsd = document.getElementById("lkrRate").value||200;
  document.querySelectorAll(".allowance").forEach(function (allowanceInput) {
    if (allowanceInput.dataset.type === "p") {
      let baseRate = parseFloat(document.getElementById("baseRate").value) ||200;
      if(baseRate == 0) return;
      else{
      let basicSalary = parseFloat(document.getElementById("basicSalary").value) || 0;
      
      let peggedAllowance = (basicSalary*((lkrFromUsd-baseRate)/baseRate));
      peggedAllowance= (peggedAllowance < 0? 0: peggedAllowance); 
      allowanceInput.value = peggedAllowance.toFixed(0);
      }
    }
  });
}

// Function to calculate forward values (like EPF, ETF, etc.)
function calculate() {
  updatePeggedAllowance();
  queryOutput = "?";
  let allowances = 0;
  let taxableAllowance = 0;
  let basicSalary = parseFloat(document.getElementById("basicSalary").value) || 0;
  queryOutput += "b="+basicSalary;
  let allowanceCount = 1;
  document.querySelectorAll(".allowance").forEach(function (allowanceInput) {
    let allowanceValue = parseFloat(allowanceInput.value) || 0;
    const isTaxable = allowanceInput.dataset.taxable === "true";

    allowances += allowanceValue;
    queryOutput += "&a"+allowanceCount+"="+allowanceValue;
    queryOutput += "&ad"+allowanceCount+"="+allowanceInput.dataset.type;
    if (isTaxable) {
      taxableAllowance += allowanceValue;
      queryOutput += "&at"+allowanceCount+"=1";
    }
    allowanceCount++;
  });
  let companyCost = parseFloat(document.getElementById("companyCost").value) || 0;
  queryOutput += "&c="+companyCost;
  let grossSalary = basicSalary + allowances;

  const taxableIncome = basicSalary + taxableAllowance;
  // Calculate deductions, APIT, etc.
  const epfEmployee = basicSalary * 0.08;
  const epfEmployer = basicSalary * 0.12;
  const etfEmployer = basicSalary * 0.03;

  // APIT Placeholder (use actual tax rates as needed)
  
  const apit = calculateAPIT(taxableIncome);
  const totalDeductions = epfEmployee + apit;
  const netSalary = grossSalary - totalDeductions;
  const totalCostLkr = grossSalary + epfEmployer + etfEmployer;
  // Display results
  const resultsTable = `
  <div class=" w-full p-4 bg-gray-50 rounded-lg shadow-md">
    <table class="text-sm text-right w-full border-collapse	">
    <caption class = "text-left">Earnings</caption>
    <tr><th>Base Salary</th><td>${basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      <tr><th>Allowances</th><td>${allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      <tr><th>Gross Salary</th><th>${grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th></tr>
      </table>
      <hr>
      <table class="text-sm text-right w-full border-collapse	">
    <caption class = "text-left">Deductions</caption>
    <tr><th>EPF (Employee)</th><td>${epfEmployee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
    <tr><th>APIT</th><td>${apit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
    <tr><th>Total Deductions</th><th>${(apit+epfEmployee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th></tr>
    </table>
    <hr>
     <table class="text-sm text-right w-full border-collapse	">
    <caption class = "text-left">Take Home Salary</caption>
    <tr><th></th><td>${grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
    <tr><th></th><td>- ${(apit+epfEmployee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
    <tr><th>Take Home Salary</th><th>${netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th></tr>
    </table>

 <input type="hidden" value="${window.location.href.split('?')[0]}${queryOutput}" id="shareURL">
    <button class="btn-copy mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200" onclick="copyURL()">Copy Share URL</button>
    <button class="btn-copy mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200" onclick="fillUSD()">Fill Foreign Currency section</button>


    </div>
    <div class="calc-section w-full p-4 bg-gray-50 rounded-lg shadow-md">
    <table class="text-sm text-right w-full">
    <caption class = "text-left">Company Cost Breakdown</caption>
    <tr><th>Base Salary</th><td>${basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      <tr><th>Allowances</th><td>+ ${allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      <tr><th>EPF (Employer)</th><td>+ ${epfEmployer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      <tr><th>ETF (Employer)</th><td>+ ${etfEmployer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
      </table>
      <hr>
       <table class="text-sm text-right w-full">
    <caption class = "text-left">Company Cost</caption>
      <tr><th></th><th>${totalCostLkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th></tr>

    </table>
    <input type="hidden" id="calculatedCompanyCost" value="${totalCostLkr}" />
         <div class="divCompanyCost"></div>
         <canvas id="chartCompanyCost" style="width:100%;max-width:600px"></canvas>
        
         
    </div>
    
 
    </div>
    
     
        
        
     
  `;
  if(totalCostLkr > 50000){
  const uniqueLabel = `${queryOutput}-${Date.now()}`;
  if (typeof gtag === 'function') {
    gtag('event', 'share_url_calculated', {
      'event_category': 'Calculation',
      'event_label': uniqueLabel
    });
  } else if (typeof ga === 'function') {
    ga('send', 'event', 'Calculation', 'share_url_calculated', uniqueLabel);
  }
  }
  
  document.getElementById("results").innerHTML = resultsTable;
  const divCompanyCost = document.querySelector('.divCompanyCost');
  setGradient(divCompanyCost,"chartCompanyCost", [
    { v:'Basic Salary',color: 'rgb(239, 71, 111)', percentage: ((basicSalary-apit-epfEmployee)*100)/totalCostLkr },
    {v:'Allowances', color: 'rgb(255, 209, 102)', percentage:(allowances*100)/totalCostLkr },
   { v:'EPF Employee (8%)',color: 'rgb(6, 214, 160)', percentage: ((epfEmployee) *100)/totalCostLkr },
    {v:'APIT',color: 'rgb(17, 138, 178)', percentage: apit*100/totalCostLkr },
   { v:'Company EPF (12%) / ETF (3%)',color: 'rgb(7, 59, 76)', percentage: ((epfEmployer+etfEmployer)*100)/totalCostLkr },

  ]);
  let x = document.getElementById("results");
  x.style.display = "flex";
}

function copyURL(){
  const shareURL = document.getElementById("shareURL");
  navigator.clipboard.writeText(shareURL.value);
  alert("URL copied to clipboard");
}

// Function to reverse calculate the company cost
function reverseCalculate() {
  const companyCost = parseFloat(document.getElementById("companyCost").value)||0;
  const usdAmount = parseFloat(document.getElementById("usdAmount").value)||0;
  const lkrRate = parseFloat(document.getElementById("lkrRate").value)||300;

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
    <table class="text-sm text-right">
     <caption class = "text-left">Equivalent LKR Salary (without allowances)</caption>
    <tr><th>Base Salary</th><td>${grossSalary.toFixed(2)}</td></tr>
      <tr><th>Gross Salary</th><td>${grossSalary.toFixed(2)}</td></tr>
      <tr><th>EPF (Employee)</th><td>${epfEmployee.toFixed(2)}</td></tr>
      <tr><th>EPF (Employer)</th><td>${epfEmployer.toFixed(2)}</td></tr>
      <tr><th>ETF (Employer)</th><td>${etfEmployer.toFixed(2)}</td></tr>
      <tr><th>APIT</th><td>${apit.toFixed(2)}</td></tr>
       <tr><th>Net Salary</th><td>${netSalary.toFixed(2)}</td></tr>
      <tr><th>Company Cost</th><td>${companyCost.toFixed(2)}</td></tr>
       <tr><td colspan="2"> <i title="NOTE: You need to make changes to basic salary to make this accurate!" class="fa fa-1.5x fa-info-circle m-r-5 p-2" style="color:blue"></i><button class="btn-copy mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200" onclick="fillResults(${companyCost.toFixed(2)})">Fill LKR Section (including allowances)</button>
       
</td></tr>
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
  let x = document.getElementById("results");
  x.style.display = "none";
}

function fillResults(companyCost){
  if(companyCost!==undefined){
    let calculatedBasic = 0;
    let basicSalary = document.getElementById("basicSalary");
    let pegged = document.getElementById('enablePeggedAllowance').value;
    let enabledInternetAllowance = document.getElementById('enableInternetAllowance').value;
    document.querySelectorAll('.allowance-group').forEach(e => e.remove());
    if(pegged==1){
    var costToBasicRatio = document.getElementById("costToBasicRatio").value || 0.6125;
    //formatNumber(Math.round(companyCost*costToBasicRatio/100)*100);
    calculatedBasic = Math.round(companyCost*costToBasicRatio/100)*100;
    //basicSalary.value = Math.round(companyCost*costToBasicRatio/100)*100;
  
    addPeggedAllowance();
    }
    if(enabledInternetAllowance==1){
    addInternetAllowance();
    }
    if(enabledInternetAllowance ==1 & pegged!=1){
      let internetAllowance = document.getElementById("internetAllowance").value||0;
      calculatedBasic = companyCost/(1.15+(internetAllowance*1.15/companyCost));
    }
    else if(enabledInternetAllowance !=1 & pegged!=1){
      calculatedBasic = companyCost/1.15;
    }
    basicSalary.value = parseFloat(calculatedBasic).toFixed(2);

 }
}

function clearAll(){
  document.querySelectorAll('.allowance-group').forEach(e => e.remove());
  var basicSalary = document.getElementById("basicSalary");
  basicSalary.value = 0;
}

function fillUSD(){
  var lkrRate = document.getElementById("lkrRate").value||200;
  var calculatedCompanyCost = document.getElementById("calculatedCompanyCost").value;
  document.getElementById("usdAmount").value = parseFloat(calculatedCompanyCost / lkrRate).toFixed(2);
  document.getElementById("companyCost").value = calculatedCompanyCost;
 }

function addPeggedAllowance(){
  let baseRate = document.getElementById("baseRate").value ||200;
  if(baseRate==0) return;
  else {
  var basicSalary = document.getElementById("basicSalary").value||0;
  var lkrFromUsd = document.getElementById("lkrRate").value||200;
  
 var peggedAllowance = basicSalary*((lkrFromUsd-baseRate)/baseRate);
 peggedAllowance= (peggedAllowance < 0? 0: peggedAllowance); 
  addAllowance(peggedAllowance.toFixed(0), true,"p");
  }
}

function addInternetAllowance(){
  let internetAllowance = document.getElementById("internetAllowance").value||0;
  if (internetAllowance == 0) return;
  else {
  let taxableAllowance = internetAllowance/2;
  addAllowance(taxableAllowance.toFixed(0), true, "i");
  addAllowance(taxableAllowance.toFixed(0), false,"i");
  }
}

// Function to add an allowance input
function addAllowance(allowance = 0, taxable = false, type = 'a') {
  const allowancesSection = document.getElementById("allowances-section");
  const allowanceGroup = document.createElement("div");
  allowanceGroup.className = "allowance-group";

  // Allowance input
  const allowanceInput = document.createElement("input");
  allowanceInput.type = "number";
  allowanceInput.className = "allowance";
  allowanceInput.placeholder = "Enter Allowance";
  allowanceInput.dataset.taxable = "false";
  allowanceInput.dataset.type = type;
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
  removeButton.innerHTML = "<i class='fa fa-trash'></i>";
  removeButton.onclick = () => allowanceGroup.remove();

  // Append elements
  allowanceGroup.appendChild(allowanceInput);
  allowanceGroup.appendChild(taxableLabel);
  allowanceGroup.appendChild(taxableCheckbox);
  allowanceGroup.appendChild(removeButton);
  allowancesSection.appendChild(allowanceGroup);
}

function displayResults(results) {
  const resultsContent = document.getElementById("results-content");
  resultsContent.innerHTML = ""; // Clear previous results

  // Create tiles for each result
  for (const [key, value] of Object.entries(results)) {
    const tile = document.createElement("div");
    tile.className = "bg-white p-4 rounded-lg shadow-md border border-gray-200";
    tile.innerHTML = `
            <h6 class="font-semibold">${key}</h4>
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
          addAllowance(queryParams.a1, true,queryParams.ad1);
        } else {
          addAllowance(queryParams.a1, false,queryParams.ad1);
        }
      }
      if(queryParams.a2!==undefined){
        if(queryParams.at2!==undefined && queryParams.at2==="1"){
          addAllowance(queryParams.a2, true, queryParams.ad2);
        } else {
          addAllowance(queryParams.a2, false, queryParams.ad2);
        }
      }
      if(queryParams.a3!==undefined){
        if(queryParams.at3!==undefined && queryParams.at3==="1"){
          addAllowance(queryParams.a3, true, queryParams.ad3);
        } else {
          addAllowance(queryParams.a3, false, queryParams.ad3);
        }
      } 
      if(queryParams.a4!==undefined){
        if(queryParams.at4!==undefined && queryParams.at4==="1"){
          addAllowance(queryParams.a4, true, queryParams.ad4);
        } else {
          addAllowance(queryParams.a4, false, queryParams.ad4);
        }
      }
      if(queryParams.a5!==undefined){
        if(queryParams.at5!==undefined && queryParams.at5==="1"){
          addAllowance(queryParams.a5, true, queryParams.ad5);
        } else {
          addAllowance(queryParams.a5, false, queryParams.ad5);
        }
      }

      if(queryParams.c!==undefined){
        var companyCost = document.getElementById("companyCost");
        companyCost.value = queryParams.c;
      }
      calculate();
}

// Call the function on page load
populateTextboxes();

function setGradient(divElement,chartElement, percentages) {

  // Validate that percentages add up to 100
  const total = percentages.reduce((sum, current) => sum + current.percentage, 0);
  var diff = total - 100 ;
  var counter = percentages.length*100;
  var countDif = diff/counter;
  if (total !== 100) {
      console.log("Percentages must add up to 100%");
     // return;
  }
  

  // Build the gradient string
  let currentPosition = 0;
  let gradient = '-webkit-linear-gradient(0deg';

  percentages.forEach(segment => {
      const nextPosition = currentPosition + segment.percentage + countDif ;
      gradient += `, ${segment.color} ${currentPosition}%, ${segment.color} ${nextPosition}%`;
      currentPosition = nextPosition;
  });

  gradient += ')';

  // Apply the gradient as the background-image style
  divElement.style.backgroundImage = gradient;
  divElement.style.width = '100%';
  divElement.style.height = '25px';
  divElement.style.borderTop = '0px solid';
  divElement.style.display = 'block';
  var xValues = percentages.map(x=>x.v);
let yValues = percentages.map(x=>x.percentage);
let barColors = percentages.map(x=>x.color);

new Chart(chartElement, {
  type: "doughnut",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    title: {
      display: true,
      text: "Company Cost Breakdown"
    },
    plugins: {
      tooltip: {
          callbacks: {
              label: function(tooltipItem) {
                  const value = tooltipItem.raw;
                  const total = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(2);
                  return `${value} (${percentage}%)`;
              }
          }
      }
    }
    
  }});
}

function formatNumber(input) {
  // Remove any non-digit characters (except for the decimal point)
  let value = input.value.replace(/[^0-9.]/g, '');
  if (value === '') {
    value = '0';
  }

  // Convert to a number and format with commas
  const formattedValue = parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // Set the formatted value back to the input
  input.value = formattedValue;

  // Update the hidden input with the raw value (remove commas)
  document.getElementById("basicSalary").value = value; // Store the raw number without formatting
}

document.getElementById('openModal').onclick = function() {
  document.getElementById('settingsModal').classList.remove('hidden');
};

document.getElementById('closeModal').onclick = function() {
  document.getElementById('settingsModal').classList.add('hidden');
};

document.getElementById('saveModal').onclick = function() {
  document.getElementById('settingsModal').classList.add('hidden');
};

document.getElementById('internetAllowance').oninput = function() {
  if(this.value == 0){
  document.getElementById('btnAddInternetAllowance').classList.add('hidden');
  }
  else{
    document.getElementById('btnAddInternetAllowance').classList.remove('hidden');
  }

};

document.getElementById('baseRate').oninput = function() {
  if(this.value == 0){
  document.getElementById('btnAddPeggedAllowance').classList.add('hidden');
  }
  else{
    document.getElementById('btnAddPeggedAllowance').classList.remove('hidden');
  }

};

document.getElementById('enablePeggedAllowance').onchange = function() {
  if(this.value == 0){
  document.getElementById('btnAddPeggedAllowance').classList.add('hidden');
  }
  else{
    document.getElementById('btnAddPeggedAllowance').classList.remove('hidden');
  }

};

document.getElementById('enableInternetAllowance').onchange = function() {
  if(this.value == 0){
  document.getElementById('btnAddInternetAllowance').classList.add('hidden');
  }
  else{
    document.getElementById('btnAddInternetAllowance').classList.remove('hidden');
  }

};

function saveSettings() {
  const settings = {
    baseRate: document.getElementById('baseRate').value,
    internetAllowance: document.getElementById('internetAllowance').value,
    costToBasicRatio: document.getElementById('costToBasicRatio').value,
    taxLogicYear: document.getElementById('taxLogicYear').value,
    enablePeggedAllowance: document.getElementById('enablePeggedAllowance').value,
    enableInternetAllowance: document.getElementById('enableInternetAllowance').value,
    defaultCurrency: document.getElementById('defaultCurrency').value
  };
  
  localStorage.setItem('slcalc_settings', JSON.stringify(settings));
}

function loadSettings() {
  const savedSettings = localStorage.getItem('slcalc_settings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    
    document.getElementById('baseRate').value = settings.baseRate || '200';
    document.getElementById('internetAllowance').value = settings.internetAllowance || '5000';
    document.getElementById('costToBasicRatio').value = settings.costToBasicRatio || '0.6';
    document.getElementById('taxLogicYear').value = settings.taxLogicYear || '2023';
    document.getElementById('enablePeggedAllowance').value = settings.enablePeggedAllowance || '1';
    document.getElementById('enableInternetAllowance').value = settings.enableInternetAllowance || '1';
    document.getElementById('defaultCurrency').value = settings.defaultCurrency || 'USD';
    document.getElementById('currency').value = settings.defaultCurrency || 'USD';
    // Update UI based on loaded settings
    if (settings.enablePeggedAllowance === '0') {
      document.getElementById('btnAddPeggedAllowance').classList.add('hidden');
    }
    if (settings.enableInternetAllowance === '0') {
      document.getElementById('btnAddInternetAllowance').classList.add('hidden');
    }
  }
}

// Update the saveModal click handler
document.getElementById('saveModal').onclick = function() {
  document.getElementById('settingsModal').classList.add('hidden');
  saveSettings();
  //calculate(); // Recalculate with new settings
};

// Call loadSettings when the page loads
document.addEventListener('DOMContentLoaded', loadSettings);