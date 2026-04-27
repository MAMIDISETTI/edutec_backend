const Exam = require('../models/Exam');

exports.createExam = async (req, res) => {
  try {
    const { title, description, timeLimit, questions, isPublished } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: 'title and at least one question required' });
    }

    const exam = await Exam.create({
      title,
      description: description || '',
      timeLimit: Number(timeLimit) || 10,
      questions,
      isPublished: isPublished !== undefined ? !!isPublished : true,
      createdBy: req.user._id,
    });

    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listExams = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isPublished: true };
    const exams = await Exam.find(filter)
      .select('-questions.options.is_correct')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (req.user.role !== 'admin') {
      if (!exam.isPublished) {
        return res.status(403).json({ message: 'Exam not published' });
      }
      const safe = exam.toObject();
      safe.questions = safe.questions.map((q) => ({
        ...q,
        options: q.options.map(({ is_correct, ...rest }) => rest),
      }));
      return res.json(safe);
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    exam.isPublished = !exam.isPublished;
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
