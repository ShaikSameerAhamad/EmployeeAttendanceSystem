import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['employee', 'manager'],
      required: [true, 'Please provide a role'],
      default: 'employee',
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate employee ID before saving if not provided
userSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    try {
      // Get the highest existing employee ID number for this role
      const lastUser = await mongoose.model('User')
        .findOne({ role: this.role })
        .sort({ employeeId: -1 });
      
      let nextNumber = 1;
      if (lastUser && lastUser.employeeId) {
        const match = lastUser.employeeId.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      
      const rolePrefix = this.role === 'manager' ? 'MGR' : 'EMP';
      this.employeeId = `${rolePrefix}${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      // Fallback: use timestamp if counting fails
      const rolePrefix = this.role === 'manager' ? 'MGR' : 'EMP';
      this.employeeId = `${rolePrefix}${String(Date.now()).slice(-3)}`;
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;

