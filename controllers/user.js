import User from "../models/user.js";
import bcrypt from "bcryptjs";
import JsonWebToken from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (user != null) {
      return res.status(400).json({ error: "email is already taken" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({
      name,
      email,
      password: hash,
    });

    newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user == null) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (user == null) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone, role, isActive } = req.body;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already taken" });
      }
    }

    // Validate role if provided
    if (role && !['customer', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be either 'customer' or 'admin'" });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    // Validate the updated user
    try {
      await user.validate();
    } catch (validationError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationError.errors 
      });
    }

    // Save updated user
    await user.save();

    // Return updated user without sensitive data
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ 
      message: "User updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive boolean is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: 'User status updated', user: updatedUser });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (user == null) {
      return res.status(400).json({ error: "Wrong email or password" });
    }

    // Block inactive accounts
    if (user.isActive === false) {
      return res.status(403).json({ error: "Your account has been blocked. Please contact support." });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect == false) {
      return res.status(400).json({ error: "Wrong email or password" });
    } else {
      // jwt token

      const token = JsonWebToken.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
      });

      return res.status(200).json({ message: "Login successful"  , user});
    }
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};
