import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: false, // Not required for Google/Facebook login
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    default: 'credentials', // google, facebook, credentials
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    default: null,
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
