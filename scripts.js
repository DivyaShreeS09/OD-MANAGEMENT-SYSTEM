/* =========================
   LOGIN PAGE PASSWORD TOGGLE
========================= */
const toggle = document.getElementById("togglePassword");
const password = document.getElementById("password");
if(toggle){
  toggle.addEventListener("click", () => {
    if(password.type === "password") password.type = "text";
    else password.type = "password";
  });
}

/* =========================
   LOGIN FORM REDIRECT
========================= */
const loginForm = document.getElementById("loginForm");
if(loginForm){
  loginForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const role = document.getElementById("role").value;
    if(!role){ alert("Select login role"); return; }
    if(role==="student") window.location.href="student.html";
    else window.location.href="dashboard.html";
  });
}

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
function renderDashboardTable(){
  if(!odTableBody) return;
  odTableBody.innerHTML = "";
  const yearFilter = filterYear ? filterYear.value : "";
  const programFilter = filterProgram ? filterProgram.value : "";
  const sectionFilter = filterSection ? filterSection.value : "";

  odRequests.forEach((req,index)=>{
    if(yearFilter && !req.program.toLowerCase().includes(yearFilter.toLowerCase())) return;
    if(programFilter && !req.program.toLowerCase().includes(programFilter.toLowerCase())) return;
    if(sectionFilter && req.section.toLowerCase() !== sectionFilter.toLowerCase()) return;

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

/* =========================
   UPDATE APPROVAL
========================= */
function updateApproval(index,role,status){
  odRequests[index].approvals[role] = status;

  const req = odRequests[index];
  const coApproved = req.approvals.classCoord === "approved" || req.approvals.yearCoord === "approved";
  const hodApproved = req.approvals.hod === "approved";

  // final status logic
  if(req.approvals.classCoord === "rejected" || req.approvals.yearCoord === "rejected" || req.approvals.hod === "rejected"){
    req.finalStatus = "rejected";
  } else if(coApproved && hodApproved){
    req.finalStatus = "approved";
  } else {
    req.finalStatus = "pending";
  }

  renderDashboardTable();
  renderStudentHistory();
}

/* =========================
   STUDENT FORM SUBMIT
========================= */
if(odForm){
  odForm.addEventListener("submit",(e)=>{
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

    const newOD = {
      id: odRequests.length+1,
      registerNo, name:studentName, program, section, reason,
      fromDate, toDate, startTime, endTime,
      approvals:{classCoord:"pending",yearCoord:"pending",hod:"pending"},
      finalStatus:"pending"
    };
    odRequests.push(newOD);
    odForm.reset();
    renderStudentHistory();
    alert("OD Request Submitted Successfully!");
  });
}

/* =========================
   RENDER STUDENT HISTORY
========================= */
function renderStudentHistory(){
  if(!studentHistory) return;
  studentHistory.innerHTML="";
  odRequests.forEach(req=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.reason}</td>
      <td>${req.fromDate} ${req.startTime} - ${req.toDate} ${req.endTime}</td>
      <td class="${req.finalStatus}">${req.finalStatus.toUpperCase()}</td>
      <td>
        ${req.finalStatus==="approved"?`<button class="login-btn" onclick='downloadStudentPDF(${req.id})'>Download PDF</button>`:"-"}
      </td>
    `;
    studentHistory.appendChild(tr);
  });
}

/* =========================
   DOWNLOAD INDIVIDUAL PDF (STUDENT)
========================= */
function downloadStudentPDF(id){
  const req = odRequests.find(r=>r.id===id);
  if(!req) return;
  const pdfContent = `
    <h2>OD Approval</h2>
    <p><strong>Student:</strong> ${req.name}</p>
    <p><strong>Register No:</strong> ${req.registerNo}</p>
    <p><strong>Program:</strong> ${req.program}</p>
    <p><strong>Section:</strong> ${req.section}</p>
    <p><strong>Reason / Subject:</strong> ${req.reason}</p>
    <p><strong>Date & Time:</strong> ${req.fromDate} ${req.startTime} - ${req.toDate} ${req.endTime}</p>
    <p><strong>Class Coordinator:</strong> ${req.approvals.classCoord}</p>
    <p><strong>Year Coordinator:</strong> ${req.approvals.yearCoord}</p>
    <p><strong>HOD:</strong> ${req.approvals.hod}</p>
    <p><strong>Final Status:</strong> ${req.finalStatus}</p>
  `;
  const blob = new Blob([pdfContent],{type:"application/pdf"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `OD_${req.registerNo}.pdf`;
  link.click();
}

/* =========================
   STAFF/HOD PDF DOWNLOAD - FORMATTED TABLE
========================= */
if(downloadSectionPDFBtn){
  downloadSectionPDFBtn.addEventListener("click", async ()=>{
    let filtered = odRequests.filter(req=>{
      if(filterYear.value && !req.program.toLowerCase().includes(filterYear.value.toLowerCase())) return false;
      if(filterProgram.value && !req.program.toLowerCase().includes(filterProgram.value.toLowerCase())) return false;
      if(filterSection.value && req.section.toLowerCase() !== filterSection.value.toLowerCase()) return false;
      return req.finalStatus==="approved";
    });

    if(filtered.length===0){ alert("No approved OD to download"); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Approved OD List", 14, 20);

    const headers = [["Register No", "Name", "Program", "Section", "Reason", "Date & Time"]];
    const rows = filtered.map(req => [
      req.registerNo,
      req.name,
      req.program,
      req.section,
      req.reason,
      `${req.fromDate} ${req.startTime} - ${req.toDate} ${req.endTime}`
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 140, 0] },
      alternateRowStyles: { fillColor: [255, 235, 179] },
      theme: 'grid'
    });

    doc.save(`Approved_OD_List.pdf`);
  });
}
/* =========================
   FILTER EVENTS
========================= */
if(filterYear) filterYear.addEventListener("change",renderDashboardTable);
if(filterProgram) filterProgram.addEventListener("change",renderDashboardTable);
if(filterSection) filterSection.addEventListener("change",renderDashboardTable);

/* =========================
   INITIAL RENDER
========================= */
renderDashboardTable();
renderStudentHistory();