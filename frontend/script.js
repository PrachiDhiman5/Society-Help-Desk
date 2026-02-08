let allComplaints = [];
let currentFilter = "all";

// USER
async function submitComplaint() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  if (!name || !email || !title || !description) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch('/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, title, description })
    });

    if (res.ok) {
      const data = await res.json();
      alert(`Complaint Submitted Successfully!\nTracking ID: ${data.id}`);

      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
    } else {
      alert("Submission failed.");
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
  try {
    const res = await fetch(`/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'admin-secret-token'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      loadComplaints();
    } else {
      alert("Failed to update status.");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating status.");
  }
}

async function deleteComplaint(id) {
  if (!confirm("Are you sure you want to delete this complaint?")) return;

  try {
    const res = await fetch(`/complaints/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'admin-secret-token'
      }
    });

    if (res.ok) {
      loadComplaints();
    } else {
      alert("Failed to delete complaint.");
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
      <div class="comp-title">${c.title}</div>
      <p>${c.description}</p>
      <div class="comp-meta">
        <strong>Reported by:</strong> ${c.name} (${c.email})<br>
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
