let allComplaints = [];
let currentFilter = "all";

// USER
async function submitComplaint() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const flatNo = document.getElementById('flatNo').value;
  const wing = document.querySelector('input[name="wing"]:checked')?.value;
  const category = document.getElementById('category').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  if (!name || !email || !flatNo || !wing || !title || !description) {
    alert("Please fill in all required fields.");
    return;
  }

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Flat Number Validation
  if (isNaN(flatNo) || flatNo.trim() === "") {
    alert("Please enter a valid numeric Flat Number.");
    return;
  }

  try {
    const res = await fetch('/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, flatNo, wing, category, title, description })
    });

    if (res.ok) {
      const data = await res.json();
      alert(`Complaint Submitted Successfully!\nTracking ID: ${data.id}`);

      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('flatNo').value = '';
      // Reset radio buttons
      const firstWing = document.querySelector('input[name="wing"]');
      if (firstWing) firstWing.checked = true;

      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
    } else {
      const errorData = await res.json();
      alert(`Submission failed: ${errorData.message || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error submitting complaint.");
  }
}

// ADMIN
async function loadComplaints() {
  try {
    const res = await fetch('/complaints');
    if (!res.ok) throw new Error("Failed to fetch complaints");
    allComplaints = await res.json();
    updateDashboard();
  } catch (err) {
    console.error(err);
  }
}

async function updateStatus(id, newStatus) {
  let adminResponse = "";
  if (newStatus === 'resolved' || newStatus === 'rejected') {
    const promptMessage = newStatus === 'resolved'
      ? "Enter a resolution message (Optional):"
      : "Enter a reason for rejection (Required):";

    adminResponse = prompt(promptMessage);

    if (newStatus === 'rejected' && (adminResponse === null || adminResponse.trim() === "")) {
      alert("A reason is required to reject an issue.");
      return;
    }
  }

  const adminToken = prompt("Enter Admin Authorization Token:");
  if (!adminToken) {
    alert("Authorization failed: No token provided.");
    return;
  }

  try {
    const res = await fetch(`/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      },
      body: JSON.stringify({ status: newStatus, adminResponse })
    });

    if (res.ok) {
      loadComplaints();
    } else {
      const errorData = await res.json();
      alert(`Authorization failed: ${errorData.message || "Invalid Token"}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error updating status.");
  }
}

async function deleteComplaint(id) {
  if (!confirm("Are you sure you want to delete this complaint?")) return;

  const adminToken = prompt("Enter Admin Authorization Token to Delete:");
  if (!adminToken) {
    alert("Delete blocked: Admin authorization required.");
    return;
  }

  try {
    const res = await fetch(`/complaints/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': adminToken
      }
    });

    if (res.ok) {
      loadComplaints();
    } else {
      const errorData = await res.json();
      alert(`Delete failed: ${errorData.message || "Not Authorized"}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting complaint.");
  }
}

function updateDashboard() {
  const total = document.getElementById('total');
  if (!total) return;

  total.innerText = allComplaints.length;
  document.getElementById('pending').innerText = allComplaints.filter(c => c.status === 'pending').length;
  document.getElementById('resolved').innerText = allComplaints.filter(c => c.status === 'resolved').length;
  document.getElementById('rejected').innerText = allComplaints.filter(c => c.status === 'rejected').length;
  renderComplaints();
}

function filterStatus(status, btn) {
  currentFilter = status;

  // Update active button state
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  renderComplaints();
}

function searchComplaints() {
  renderComplaints();
}

function renderComplaints() {
  const list = document.getElementById('complaintList');
  if (!list) return;

  const search = document.getElementById('search')?.value.toLowerCase() || "";

  list.innerHTML = '';

  let filtered = allComplaints.filter(c =>
    (currentFilter === "all" || c.status === currentFilter) &&
    (c.title.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) ||
      String(c.id).includes(search))
  );

  filtered.forEach(c => {
    const div = document.createElement('div');
    div.className = `complaint-card ${c.status}`;
    div.innerHTML = `
      <div class="card-header">
        <span class="comp-id">COMPLAINT ID: #${c.id}</span>
        <span class="status-badge ${c.status}">${c.status}</span>
      </div>
      <div class="comp-title">
        <span class="category-tag">${c.category}</span> ${c.title}
      </div>
      <p>${c.description}</p>
      ${c.adminResponse ? `
        <div class="admin-response">
          <strong>Official Response:</strong> ${c.adminResponse}
        </div>
      ` : ''}
      <div class="comp-meta">
        <strong>Reported by:</strong> ${c.name} (${c.email})<br>
        <strong>Location:</strong> Flat ${c.flatNo}, Wing ${c.wing}<br>
        <strong>Date:</strong> ${new Date(c.createdAt).toLocaleString()}
      </div>
      <div class="card-actions">
        ${c.status === 'pending' ? `
          <button class="action-btn btn-resolve" onclick="updateStatus(${c.id}, 'resolved')">Resolve Issue</button>
          <button class="action-btn btn-reject" onclick="updateStatus(${c.id}, 'rejected')">Reject Issue</button>
        ` : ''}
        <button class="action-btn btn-delete" onclick="deleteComplaint(${c.id})">Delete Permanent</button>
      </div>
    `;
    list.appendChild(div);
  });
}

if (document.getElementById('complaintList')) {
  loadComplaints();
}
