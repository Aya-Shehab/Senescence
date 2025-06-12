import Contact from '../models/contact.js';

export const submitContact = async (req, res) => {
  try {
    const { username, email, phone, subject, message } = req.body;

    if (!username || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const newContact = new Contact({
      username,
      email,
      phone,
      subject,
      message
    });

    await newContact.save();

    return res.status(201).json({
      message: 'Contact form submitted successfully',
      contact: newContact
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error .. try again later' });
  }
}; 