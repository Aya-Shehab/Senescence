import customOrder from "../models/customOrder.js";

export const createCustomOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      description,
      preferredDate,
      notes
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !description
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Phone number must be 11 digits" });
    }

    if (address.length < 10) {
      return res
        .status(400)
        .json({ error: "Address must be at least 10 characters long" });
    }

    if (description.length < 15) {
      return res
        .status(400)
        .json({ error: "Description must be at least 15 characters long" });
    }

    const imageUrl = req.file ? req.file.path : null;

    const newOrder = new customOrder({
      firstName,
      lastName,
      email,
      phone,
      address,
      description,
      preferredDate: preferredDate || null,
      imageUrl,
      notes: notes || null,
      status: "pending",
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Custom order created successfully",
      order: newOrder,
    });
  } catch (e) {
    console.error('Custom order creation error:', e);
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const getAllCustomOrders = async (req, res) => {
  try {
    const orders = await customOrder.find();
    res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const getCustomOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await customOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Custom order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const deleteCustomOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await customOrder.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ error: "Custom order not found" });
    }
    res.status(200).json({ message: "Custom order deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const updateCustomOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      description,
      preferredDate,
      notes,
      status
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !address || !description) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Phone number must be 11 digits" });
    }

    if (address.length < 10) {
      return res.status(400).json({ error: "Address must be at least 10 characters long" });
    }

    if (description.length < 15) {
      return res.status(400).json({ error: "Description must be at least 15 characters long" });
    }

    const updatedOrder = await customOrder.findByIdAndUpdate(
      orderId,
      {
        firstName,
        lastName,
        email,
        phone,
        address,
        description,
        preferredDate: preferredDate || null,
        notes: notes || null,
        status: status || 'pending'
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Custom order not found" });
    }

    res.status(200).json({
      message: "Custom order updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error('Custom order update error:', error);
    return res.status(500).json({ error: "Internal server error .. try again later" });
  }
};