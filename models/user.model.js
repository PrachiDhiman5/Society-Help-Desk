import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ['resident', 'admin'],
        default: 'resident'
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
