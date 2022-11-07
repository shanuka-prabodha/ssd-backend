const mongoose = require('mongoose');
const uuid = require('uuid');

const schema = {
  id: {
    type: String,
    default: uuid.v4,
    index: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true },
  accountType: { type: String, enum: ['worker', 'manager'], default: 'worker' },
};

const timestamps = { createdAt: 'created_at', updatedAt: 'updated_at' };

const userSchema = new mongoose.Schema(schema, { timestamps });

const Users = mongoose.model('user', userSchema);

module.exports = Users;
