const { v4: uuidv4 } = require('uuid');
const Course = require('../models/Course');

const SUB_ITEM_TYPES = Course.SUB_ITEM_TYPES || [
  'cheatsheet',
  'mcq',
  'note',
  'link',
];

const generateSId =
  Course.generateSId ||
  (() => `s_${uuidv4().replace(/-/g, '').slice(0, 8)}`);

const sanitizeSubItem = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const type = SUB_ITEM_TYPES.includes(raw.type) ? raw.type : 'cheatsheet';
  const item = {
    uuid: raw.uuid || uuidv4(),
    s_id: raw.s_id || generateSId(),
    title: String(raw.title || '').trim(),
    type,
    content: typeof raw.content === 'string' ? raw.content : '',
    examId: raw.examId || null,
  };
  if (!item.title) return null;
  return item;
};

const ensureSubItemIds = (course) => {
  let mutated = false;
  course.subItems.forEach((s) => {
    if (!s.s_id) {
      s.s_id = generateSId();
      mutated = true;
    }
    if (!s.uuid) {
      s.uuid = uuidv4();
      mutated = true;
    }
  });
  return mutated;
};

exports.listCourses = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isPublished: true };
    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .populate('subItems.examId', 'title timeLimit isPublished');

    await Promise.all(
      courses.map(async (c) => {
        if (ensureSubItemIds(c)) await c.save();
      })
    );

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid }).populate(
      'subItems.examId',
      'title timeLimit isPublished'
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && !course.isPublished) {
      return res.status(403).json({ message: 'Course not published' });
    }

    if (ensureSubItemIds(course)) await course.save();

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, isPublished, subItems } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'title is required' });
    }

    const cleanedSubItems = Array.isArray(subItems)
      ? subItems.map(sanitizeSubItem).filter(Boolean)
      : [];

    const course = await Course.create({
      uuid: uuidv4(),
      title: String(title).trim(),
      description: description || '',
      isPublished: !!isPublished,
      subItems: cleanedSubItems,
      createdBy: req.user._id,
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, description, isPublished } = req.body;
    if (title !== undefined) course.title = String(title).trim();
    if (description !== undefined) course.description = description;
    if (isPublished !== undefined) course.isPublished = !!isPublished;

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ uuid: req.params.uuid });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted', uuid: course.uuid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSubItem = async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const item = sanitizeSubItem(req.body);
    if (!item) {
      return res
        .status(400)
        .json({ message: 'Sub-item title is required' });
    }

    course.subItems.push(item);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSubItem = async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sub = course.subItems.find((s) => s.uuid === req.params.subUuid);
    if (!sub) return res.status(404).json({ message: 'Sub-item not found' });

    const { title, type, content, examId } = req.body;
    if (title !== undefined) sub.title = String(title).trim();
    if (type !== undefined && SUB_ITEM_TYPES.includes(type)) sub.type = type;
    if (content !== undefined) sub.content = content;
    if (examId !== undefined) sub.examId = examId || null;

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubItem = async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const before = course.subItems.length;
    course.subItems = course.subItems.filter(
      (s) => s.uuid !== req.params.subUuid
    );
    if (course.subItems.length === before) {
      return res.status(404).json({ message: 'Sub-item not found' });
    }

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
