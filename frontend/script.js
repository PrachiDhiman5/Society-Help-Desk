let allComplaints = [];
let deletedComplaints = [];
let currentFilter = "all";
let showingDeleted = false;

// --- USER PORTAL LOGIC ---

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

      // Clear Form
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('flatNo').value = '';
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';

      // Focus on tracker
      document.getElementById('trackId').value = data.id;
      trackComplaint();
    } else {
      const errorData = await res.json();
      alert(`Submission failed: ${errorData.message || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error submitting complaint.");
  }
}

async function trackComplaint() {
  const trackId = document.getElementById('trackId').value.trim();
  const resultDiv = document.getElementById('trackResult');

  if (!trackId) {
    alert("Please enter a Complaint ID.");
    return;
  }

  try {
    const res = await fetch(`/complaints/${trackId}`);
    if (res.ok) {
      const complaint = await res.json();
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div class="card-header">
          <span class="comp-id">ID: ${complaint.id}</span>
          <span class="status-badge ${complaint.status}">${complaint.status}</span>
        </div>
        <div class="comp-title">
          <span class="category-tag">${complaint.category}</span> ${complaint.title}
        </div>
        <p style="margin-bottom: 1rem;">${complaint.description}</p>
        ${complaint.adminResponse ? `
          <div class="admin-response">
            <strong>Official Response:</strong><br>${complaint.adminResponse}
          </div>
        ` : '<p style="color: var(--text-muted); font-style: italic;">Status: Awaiting admin review.</p>'}
        <div class="comp-meta">
          <strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleString()}
        </div>
      `;
      // Scroll into view
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert("Complaint not found. Please check the ID.");
      resultDiv.style.display = 'none';
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching complaint status.");
  }
}

// --- ADMIN PORTAL LOGIC ---

async function loadComplaints() {
  try {
    const res = await fetch('/complaints');
    if (!res.ok) throw new Error("Failed to fetch complaints");
    allComplaints = await res.json();
    if (!showingDeleted) updateDashboard();
  } catch (err) {
    console.error(err);
  }
}

async function loadDeletedComplaints() {
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch('/complaints/deleted', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch deleted complaints");
    deletedComplaints = await res.json();
    renderComplaints();
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

  const token = localStorage.getItem('adminToken');
  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = '/';
    return;
  }

  try {
    const res = await fetch(`/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus, adminResponse })
    });

    if (res.ok) {
      loadComplaints();
    } else {
      const errorData = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/';
      }
      alert(`Action failed: ${errorData.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error updating status.");
  }
}

async function deleteComplaint(id) {
  if (!confirm("Are you sure you want to move this complaint to the Recycle Bin?")) return;

  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    const res = await fetch(`/complaints/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      loadComplaints();
    } else {
      const errorData = await res.json();
      alert(`Delete failed: ${errorData.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting complaint.");
  }
}

async function restoreComplaint(id) {
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch(`/complaints/${id}/restore`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      loadDeletedComplaints();
      loadComplaints();
    } else {
      alert("Restore failed");
    }
  } catch (err) {
    console.error(err);
  }
}

async function permanentDelete(id) {
  if (!confirm("CRITICAL: This will permanently remove the complaint from the database. This action cannot be undone. Proceed?")) return;
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch(`/complaints/${id}/permanent`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      loadDeletedComplaints();
    } else {
      alert("Permanent delete failed");
    }
  } catch (err) {
    console.error(err);
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
  showingDeleted = (status === 'deleted');
  currentFilter = status;

  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  if (showingDeleted) {
    loadDeletedComplaints();
  } else {
    renderComplaints();
  }
}

function searchComplaints() {
  renderComplaints();
}

function renderComplaints() {
  const list = document.getElementById('complaintList');
  if (!list) return;

  const search = document.getElementById('search')?.value.toLowerCase() || "";
  list.innerHTML = '';

  const sourceList = showingDeleted ? deletedComplaints : allComplaints;

  let filtered = sourceList.filter(c =>
    (showingDeleted || currentFilter === "all" || c.status === currentFilter) &&
    (c.title.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) ||
      c.id.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 1.25rem;">${showingDeleted ? "Recycle Bin is empty." : "No complaints found matching your criteria."}</p>
      </div>
    `;
    return;
  }

  filtered.forEach(c => {
    const div = document.createElement('div');
    div.className = `complaint-card ${c.status} ${showingDeleted ? 'deleted-card' : ''}`;
    div.innerHTML = `
      <div class="card-header">
        <span class="comp-id">ID: ${c.id}</span>
        <span class="status-badge ${c.status}">${c.status}</span>
      </div>
      <div class="comp-title">
        <span class="category-tag">${c.category}</span> ${c.title}
      </div>
      <p>${c.description}</p>
      ${c.adminResponse ? `
        <div class="admin-response">
          <strong>Resolution:</strong> ${c.adminResponse}
        </div>
      ` : ''}
      <div class="comp-meta">
        <strong>Reported by:</strong> ${c.name} (${c.email})<br>
        <strong>Location:</strong> Flat ${c.flatNo}, Wing ${c.wing}<br>
        <strong>Date:</strong> ${new Date(c.createdAt).toLocaleString()}
      </div>
      <div class="card-actions">
        ${!showingDeleted ? `
          ${c.status === 'pending' ? `
            <button class="action-btn btn-resolve" onclick="updateStatus('${c.id}', 'resolved')">Resolve Issue</button>
            <button class="action-btn btn-reject" onclick="updateStatus('${c.id}', 'rejected')">Reject Issue</button>
          ` : ''}
          <button class="action-btn btn-delete" onclick="deleteComplaint('${c.id}')">Delete</button>
        ` : `
          <button class="action-btn btn-resolve" onclick="restoreComplaint('${c.id}')">Restore Complaint</button>
          <button class="action-btn btn-delete" onclick="permanentDelete('${c.id}')">Permanent Delete</button>
        `}
      </div>
    `;
    list.appendChild(div);
  });
}

// Auto-load if on admin page
if (document.getElementById('complaintList')) {
  loadComplaints();
}
