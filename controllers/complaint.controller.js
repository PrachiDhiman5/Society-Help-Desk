let complaints = [];
let idCounter = 1;

export const getAllComplaints = (req, res) => {
  res.json(complaints);
};


export const getComplaintById = (req, res) => {
  const id = Number(req.params.id);
  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  res.json(complaint);
};


export const createComplaint = (req, res) => {
  const { name, email, title, description } = req.body;

  
  const customId = Math.floor(100000 + Math.random() * 900000);

  const newComplaint = {
    id: customId,
    name,
    email,
    title,
    description,
    status: "pending",
    createdAt: new Date()
  };

  complaints.push(newComplaint);
  res.status(201).json(newComplaint);
};


export const updateComplaintStatus = (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  complaint.status = status;
  res.json(complaint);
};


export const deleteComplaint = (req, res) => {
  const id = Number(req.params.id);
  complaints = complaints.filter(c => c.id !== id);

  res.json({ message: "Complaint deleted successfully" });
};
