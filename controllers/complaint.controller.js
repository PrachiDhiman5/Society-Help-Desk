import Complaint from '../models/complaint.model.js';

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getComplaintById = async (req, res) => {
  try {
    const id = req.params.id;
    const complaint = await Complaint.findOne({ id: id, isDeleted: false });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createComplaint = async (req, res) => {
  const { name, email, title, description, flatNo, wing, category } = req.body;

  if (!name || !email || !title || !description || !flatNo || !wing || !category) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (isNaN(flatNo) || String(flatNo).trim() === "") {
    return res.status(400).json({ message: "Flat Number must be numeric." });
  }

  const customId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const newComplaint = new Complaint({
      id: customId,
      name,
      email,
      title,
      description,
      flatNo,
      wing,
      category,
      status: "pending",
      createdAt: new Date()
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateComplaintStatus = async (req, res) => {
  const id = req.params.id;
  const { status, adminResponse } = req.body;

  try {
    const complaint = await Complaint.findOne({ id: id, isDeleted: false });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    if (adminResponse) {
      complaint.adminResponse = adminResponse;
    }
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteComplaint = async (req, res) => {
  const id = req.params.id;
  try {
    // Soft Delete: Just update the isDeleted flag
    const complaint = await Complaint.findOne({ id: id });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.isDeleted = true;
    await complaint.save();

    res.json({ message: "Complaint deleted successfully (Soft Delete)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Recycle Bin Functions ---

export const getDeletedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDeleted: true }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreComplaint = async (req, res) => {
  const id = req.params.id;
  try {
    const complaint = await Complaint.findOne({ id: id });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    complaint.isDeleted = false;
    await complaint.save();
    res.json({ message: "Complaint restored successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const permanentlyDeleteComplaint = async (req, res) => {
  const id = req.params.id;
  try {
    const complaint = await Complaint.findOneAndDelete({ id: id });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Complaint permanently deleted from database" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaintsByEmail = async (req, res) => {
  const email = req.params.email.toLowerCase();
  try {
    const complaints = await Complaint.find({ email: email, isDeleted: false }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
