document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     PASSWORD TOGGLE (👁️)
  ========================= */
  const toggle = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (toggle && passwordInput) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", () => {
      passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });
  }

  /* =========================
     LOGIN (Frontend -> Backend)
  ========================= */
  const loginForm = document.getElementById("loginForm");
  const loginStatus = document.getElementById("loginStatus");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const role = document.getElementById("role")?.value || "";
      const username = document.getElementById("username")?.value.trim() || "";
      const pwd = document.getElementById("password")?.value || "";

      if (!role) return showStatus("❌ Select Role");
      if (!username || !pwd) return showStatus("❌ Enter Username & Password");

      showStatus("⏳ Logging in...");

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, username, password: pwd })
        });

        // If backend returns non-JSON, this prevents crash
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { message: text }; }

        if (!res.ok) {
          return showStatus(`❌ ${data.message || "Login failed"}`);
        }

        // ✅ success
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);

        showStatus("✅ Login success. Redirecting...");

        setTimeout(() => {
          if (data.role === "student") window.location.href = "student.html";
          else window.location.href = "dashboard.html";
        }, 300);

      } catch (err) {
        console.error("FETCH FAILED:", err);
        showStatus("❌ Backend not reachable. Run backend: npm start");
      }
    });
  }

  function showStatus(msg) {
    if (loginStatus) loginStatus.textContent = msg;
    else alert(msg);
  }

  /* =========================
     HEADER: LOGGED USER + LOGOUT
  ========================= */
  const loggedUser = document.getElementById("loggedUser");
  if (loggedUser) {
    loggedUser.textContent = "Logged In: " + (localStorage.getItem("name") || "User");
  }

  const logout_btn = document.getElementById("logout_btn");
  if (logout_btn) {
    logout_btn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // Only render these if we are on the pages that have them
  if (document.getElementById("odTableBody")) renderDashboardTable();
  if (document.getElementById("studentHistory")) renderStudentHistory();
});

/* =========================
   SAMPLE OD DATA
========================= */
let odRequests = [
  {id:1, registerNo:"145611001", name:"Ravi Kumar", program:"B.E CSE AIML", section:"A2", reason:"TECH EVENT - MINDCRAFT AI", fromDate:"2026-01-22", toDate:"2026-01-22", startTime:"09:00", endTime:"15:00", approvals:{classCoord:"pending",yearCoord:"pending",hod:"pending"}, finalStatus:"pending"},
  {id:2, registerNo:"145611002", name:"Anjali R", program:"B.E CSE", section:"B1", reason:"NSS WORK", fromDate:"2026-01-23", toDate:"2026-01-23", startTime:"10:00", endTime:"14:00", approvals:{classCoord:"pending",yearCoord:"pending",hod:"pending"}, finalStatus:"pending"},
  {id:3, registerNo:"145611003", name:"Kiran P", program:"B.E CSE AIML", section:"A1", reason:"LAB PROJECT WORK", fromDate:"2026-01-24", toDate:"2026-01-24", startTime:"09:00", endTime:"13:00", approvals:{classCoord:"pending",yearCoord:"pending",hod:"pending"}, finalStatus:"pending"}
];

/* =========================
   DASHBOARD ELEMENTS
========================= */
const odTableBody = document.getElementById("odTableBody");
const filterYear = document.getElementById("filterYear");
const filterProgram = document.getElementById("filterProgram");
const filterSection = document.getElementById("filterSection");
const downloadSectionPDFBtn = document.getElementById("downloadSectionPDF");

/* =========================
   STUDENT ELEMENTS
========================= */
const odForm = document.getElementById("odForm");
const studentHistory = document.getElementById("studentHistory");

/* =========================
   RENDER DASHBOARD TABLE
========================= */
function renderDashboardTable() {
  if (!odTableBody) return;
  odTableBody.innerHTML = "";

  const yearFilter = filterYear ? filterYear.value : "";
  const programFilter = filterProgram ? filterProgram.value : "";
  const sectionFilter = filterSection ? filterSection.value : "";

  odRequests.forEach((req, index) => {
    if (yearFilter && !req.program.toLowerCase().includes(yearFilter.toLowerCase())) return;
    if (programFilter && !req.program.toLowerCase().includes(programFilter.toLowerCase())) return;
    if (sectionFilter && req.section.toLowerCase() !== sectionFilter.toLowerCase()) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.registerNo}</td>
      <td>${req.name}</td>
      <td>${req.program}</td>
      <td>${req.section}</td>
      <td>${req.reason}</td>
      <td>${req.fromDate} ${req.startTime} - ${req.toDate} ${req.endTime}</td>
      <td>
        <button class="approve-btn" onclick="updateApproval(${index},'classCoord','approved')">✅</button>
        <button class="reject-btn" onclick="updateApproval(${index},'classCoord','rejected')">❌</button>
        <button class="pending-btn" onclick="updateApproval(${index},'classCoord','pending')">⏳</button>
      </td>
      <td>
        <button class="approve-btn" onclick="updateApproval(${index},'yearCoord','approved')">✅</button>
        <button class="reject-btn" onclick="updateApproval(${index},'yearCoord','rejected')">❌</button>
        <button class="pending-btn" onclick="updateApproval(${index},'yearCoord','pending')">⏳</button>
      </td>
      <td>
        <button class="approve-btn" onclick="updateApproval(${index},'hod','approved')">✅</button>
        <button class="reject-btn" onclick="updateApproval(${index},'hod','rejected')">❌</button>
        <button class="pending-btn" onclick="updateApproval(${index},'hod','pending')">⏳</button>
      </td>
      <td class="${req.finalStatus}">${req.finalStatus.toUpperCase()}</td>
    `;
    odTableBody.appendChild(tr);
  });
}

function updateApproval(index, role, status) {
  odRequests[index].approvals[role] = status;

  const req = odRequests[index];
  const coApproved = req.approvals.classCoord === "approved" || req.approvals.yearCoord === "approved";
  const hodApproved = req.approvals.hod === "approved";

  if (req.approvals.classCoord === "rejected" || req.approvals.yearCoord === "rejected" || req.approvals.hod === "rejected") {
    req.finalStatus = "rejected";
  } else if (coApproved && hodApproved) {
    req.finalStatus = "approved";
  } else {
    req.finalStatus = "pending";
  }

  renderDashboardTable();
  renderStudentHistory();
}

if (odForm) {
  odForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const studentName = document.getElementById("studentName").value;
    const program = document.getElementById("program").value;
    const registerNo = document.getElementById("registerNo").value;
    const section = document.getElementById("section").value;
    const reason = document.getElementById("reason").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    odRequests.push({
      id: odRequests.length + 1,
      registerNo,
      name: studentName,
      program,
      section,
      reason,
      fromDate,
      toDate,
      startTime,
      endTime,
      approvals: { classCoord: "pending", yearCoord: "pending", hod: "pending" },
      finalStatus: "pending"
    });

    odForm.reset();
    renderStudentHistory();
    alert("OD Request Submitted Successfully!");
  });
}

function renderStudentHistory() {
  if (!studentHistory) return;
  studentHistory.innerHTML = "";

  odRequests.forEach((req) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.reason}</td>
      <td>${req.fromDate} ${req.startTime} - ${req.toDate} ${req.endTime}</td>
      <td class="${req.finalStatus}">${req.finalStatus.toUpperCase()}</td>
      <td>${req.finalStatus === "approved" ? `<button class="login-btn" onclick="downloadStudentPDF(${req.id})">Download PDF</button>` : "-"}</td>
    `;
    studentHistory.appendChild(tr);
  });
}

function downloadStudentPDF(id) {
  const req = odRequests.find((r) => r.id === id);
  if (!req) return;

  const blob = new Blob(
    [`OD Approval\n\nStudent: ${req.name}\nRegister No: ${req.registerNo}\nProgram: ${req.program}\nSection: ${req.section}\nReason: ${req.reason}\nDate & Time: ${req.fromDate} ${req.startTime} - ${req.toDate} ${req.endTime}\n\nFinal Status: ${req.finalStatus}\n`],
    { type: "application/pdf" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `OD_${req.registerNo}.pdf`;
  link.click();
}
console.log(`[${new Date().toISOString()}] Login attempt`);

if (filterYear) filterYear.addEventListener("change", renderDashboardTable);
if (filterProgram) filterProgram.addEventListener("change", renderDashboardTable);
if (filterSection) filterSection.addEventListener("change", renderDashboardTable);
