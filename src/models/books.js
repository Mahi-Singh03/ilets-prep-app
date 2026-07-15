import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  coverPhotoId: {
    type: String,
    trim: true,
  },
  coverPhotoUrl: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'Basic Computer', 
      'MS Word', 
      'AutoCAD', 
      'Programming', 
      'Web Designing', 
      'Graphic Designing', 
      'Animation', 
      'Computer Accountancy',
      'Other'
    ],
    default: 'Other',
  },
  publishedDate: {
    type: Date,
    default: null,
  },
  pdfUrl: {
    type: String,
    trim: true,
  },
  pdfLink: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      ret.id = doc._id.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

resourceSchema.index({ title: 'text', description: 'text' });
resourceSchema.index({ category: 1 });

resourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

resourceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
export default Resource;