
function getLoansFromStorage() {
  const raw = localStorage.getItem("loans");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return parsed.map(l => ({
      name: l.name || "",
      phone: l.phone || "",
      principal: Number(l.principal) || 0,
      
      dateBorrowed: l.dateBorrowed ? new Date(l.dateBorrowed) : new Date(),
      
      payments: (l.payments || []).map(p => ({
        amount: Number(p.amount) || 0,
        date: p && p.date ? new Date(p.date) : new Date()
      }))
    }));
  } catch (err) {
    console.error("Error parsing loans from localStorage:", err);
    return [];
  }
}

let loans = getLoansFromStorage();

// Add new loan
document.getElementById("loanForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const principalRaw = parseFloat(document.getElementById("amount").value);
  const principal = isNaN(principalRaw) ? 0 : principalRaw;
  const dateValue = document.getElementById("dateBorrowed").value;
  const dateBorrowed = dateValue ? new Date(dateValue) : new Date();

  const loan = { name, phone, principal, dateBorrowed, payments: [] };
  loans.push(loan);
  saveAndDisplayLoans();
  this.reset();
});

// Record a payment
document.getElementById("paymentForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const phone = document.getElementById("borrowerPhone").value.trim();
  const amountRaw = parseFloat(document.getElementById("paidAmount").value);
  const amount = isNaN(amountRaw) ? 0 : amountRaw;
  const payDateInput = document.getElementById("paymentDate").value;
  const payDate = payDateInput ? new Date(payDateInput) : new Date();

  const loan = loans.find(l => l.phone === phone);

  if (!loan) {
    alert("No loan found for that phone number.");
    return;
  }

  loan.payments.push({ amount: amount, date: payDate });
  saveAndDisplayLoans();
  this.reset();
});

// Calculating using reducing balance with monthly interest 
function calculateLoan(l) {
  let balance = Number(l.principal) || 0;
  let totalPaid = 0;
  let accumulatedInterest = 0;

  // make a copy and sort payments by date (works whether stored as Date or string)
  const payments = (l.payments || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  let currentDate = new Date(l.dateBorrowed);

  payments.forEach(payment => {
    const paymentDate = new Date(payment.date);

    let monthsPassed = (paymentDate.getFullYear() - currentDate.getFullYear()) * 12
      + (paymentDate.getMonth() - currentDate.getMonth());
    if (monthsPassed < 0) monthsPassed = 0;

    // Applying interest month-by-month
    for (let i = 0; i < monthsPassed; i++) {
      let interest = balance * 0.05; // (5%/month)
      balance += interest;
      accumulatedInterest += interest;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Apply payment
    const payAmt = Number(payment.amount) || 0;
    balance -= payAmt;
    totalPaid += payAmt;
    if (balance < 0) balance = 0;
  });

  // Applying interest from last payment to today
  let today = new Date();
  let monthsLeft = (today.getFullYear() - currentDate.getFullYear()) * 12
    + (today.getMonth() - currentDate.getMonth());
  for (let i = 0; i < monthsLeft; i++) {
    let interest = balance * 0.05;
    balance += interest;
    accumulatedInterest += interest;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return { balance, totalPaid, accumulatedInterest };
}

// Display loans
function displayLoans() {
  const tbody = document.querySelector("#loanTable tbody");
  tbody.innerHTML = ""; 

  loans.forEach((loan, index) => {
    const { balance, totalPaid, accumulatedInterest } = calculateLoan(loan);
    const status = balance === 0 ? "Paid" : totalPaid === 0 ? "Pending" : "Partial";

    const principal = Number(loan.principal) || 0;
    const dateBorrowedStr = loan.dateBorrowed ? new Date(loan.dateBorrowed).toLocaleDateString() : "";
    const todayStr = new Date().toLocaleDateString();

    const row = tbody.insertRow();

    row.insertCell().textContent = loan.name;
    row.insertCell().textContent = loan.phone;
    row.insertCell().textContent = principal.toFixed(2);
    row.insertCell().textContent = dateBorrowedStr;
    row.insertCell().textContent = todayStr;
    row.insertCell().textContent = totalPaid.toFixed(2);
    row.insertCell().textContent = accumulatedInterest.toFixed(2);
    row.insertCell().textContent = balance.toFixed(2);
    row.insertCell().textContent = status;

    
    const trendCell = row.insertCell();
    const trendLink = document.createElement("a");
    trendLink.href = `payments.html?phone=${encodeURIComponent(loan.phone)}`;
    trendLink.textContent = "View Trend";
    trendCell.appendChild(trendLink);

    // Delete button 
    const deleteCell = row.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.dataset.index = index;
    deleteBtn.textContent = "Delete";
    deleteCell.appendChild(deleteBtn);
  });

  // deleting
  document.querySelectorAll(".delete").forEach(btn => {
    btn.addEventListener("click", function() {
      const idx = Number(this.dataset.index);
      if (!Number.isNaN(idx)) {
        loans.splice(idx, 1);
        saveAndDisplayLoans();
      }
    });
  });
}

// Saving to localStorage 
function saveAndDisplayLoans() {
  try {
    localStorage.setItem("loans", JSON.stringify(loans));
  } catch (e) {
    console.error("Failed to save loans:", e);
  }
  displayLoans();
}

displayLoans();
