import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- NEW FUNCTION: Register ---
// This will create a new user with a correctly hashed password.
export const register = async (req, res) => {
  const { name, email, password, role, departmentId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      departmentId
    });

    res.status(201).json({
      message: "User created successfully!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error('--- REGISTER ERROR ---', error);
    res.status(500).json({ message: 'An internal server error occurred during registration.' });
  }
};


// --- LOGIN FUNCTION (Restored to use bcrypt) ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Use bcrypt to compare the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (error) {
    console.error('--- LOGIN ERROR ---', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};