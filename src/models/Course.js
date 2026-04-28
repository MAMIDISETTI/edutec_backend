const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SUB_ITEM_TYPES = ['cheatsheet', 'mcq', 'note', 'link'];

const generateSId = () => `s_${uuidv4().replace(/-/g, '').slice(0, 8)}`;

const subItemSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    s_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generateSId,
    },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: SUB_ITEM_TYPES,
      default: 'cheatsheet',
    },
    content: { type: String, default: '' },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => uuidv4(),
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    subItems: { type: [subItemSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

courseSchema.pre('save', function setUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', courseSchema);
module.exports.SUB_ITEM_TYPES = SUB_ITEM_TYPES;
module.exports.generateSId = generateSId;
