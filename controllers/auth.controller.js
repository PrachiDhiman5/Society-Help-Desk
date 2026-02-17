import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, username: user.username, role: user.role });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const registerResident = async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Username and Email are required." });
    }

    if (username.toLowerCase() === 'admin') {
        return res.status(400).json({ message: "Username 'admin' is reserved." });
    }

    const normalizedEmail = email.toLowerCase();

    try {
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ message: "Account already exists with this email. Please Login." });
        }

        user = new User({
            username,
            email: normalizedEmail,
            role: 'resident'
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: 'resident' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(201).json({
            token,
            username: user.username,
            role: 'resident',
            email: user.email
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    const { token, role } = req.body; // role passed from splash
    console.log(`Attempting Google Login for role: ${role}`);

    // Critical check for Railway environment
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
        console.error("Missing critical environment variables: GOOGLE_CLIENT_ID or JWT_SECRET");
        return res.status(500).json({
            message: "Server Configuration Error: Missing Authentication Keys in Railway variables."
        });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { sub, email, name, picture } = ticket.getPayload();
        console.log(`Google Token Verified for email: ${email}`);
        const normalizedEmail = email.toLowerCase();

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`User not found for email: ${normalizedEmail}`);
            return res.status(404).json({
                message: "No account found for this email. Please SIGN UP first as a Resident."
            });
        }

        console.log(`User found: ${user.username}, Role: ${user.role}`);
        // Sync Google info if not present
        let updated = false;
        if (!user.googleId) {
            user.googleId = sub;
            user.avatar = picture;
            updated = true;
        }

        // Special handling for the rare case where an admin uses Google (not recommended but supported)
        if (role === 'admin' && user.role !== 'admin' && user.username === 'admin') {
            user.role = 'admin';
            updated = true;
        }

        if (updated) await user.save();

        const tokenRole = user.role;

        const jwtToken = jwt.sign(
            { id: user._id, role: tokenRole },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        console.log(`JWT Generated for user, role: ${tokenRole}`);
        res.json({
            token: jwtToken,
            username: user.username,
            role: tokenRole,
            email: user.email
        });
    } catch (error) {
        console.error("Google Login Error Detail:", error);
        res.status(401).json({ message: `Google Authentication Failed: ${error.message}` });
    }
};

export const logout = async (req, res) => {
    try {
        // Removed logic that resets user role to resident on logout
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed admin if not exists (for demo purposes)
export const setupAdmin = async (req, res) => {
    try {
        let adminUser = await User.findOne({ username: 'admin' });

        if (adminUser) {
            // If admin exists but role was changed or password needs reset
            adminUser.role = 'admin';
            adminUser.password = process.env.ADMIN_PASSWORD || 'admin123';
            await adminUser.save();
            return res.status(200).json({ message: "Admin account verified and restored successfully" });
        }

        const newAdmin = new User({
            username: 'admin',
            email: 'admin@tracker.com'.toLowerCase(),
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin'
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin account created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
