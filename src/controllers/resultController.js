const Result = require('../models/Result');
const Exam = require('../models/Exam');

exports.submitResult = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'examId and answers required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    let score = 0;
    const total = exam.questions.length;

    for (const q of exam.questions) {
      const submitted = answers.find((a) => a.questionId === q.id);
      if (!submitted) continue;
      const correctOpt = q.options.find(
        (o) => String(o.is_correct).toLowerCase() === 'true'
      );
      if (correctOpt && correctOpt.id === submitted.selectedOptionId) {
        score += 1;
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const result = await Result.create({
      student: req.user._id,
      exam: exam._id,
      answers,
      score,
      total,
      percentage,
    });

    res.status(201).json({
      _id: result._id,
      examTitle: exam.title,
      score,
      total,
      percentage,
      correct: score,
      wrong: total - score,
      submittedAt: result.submittedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.myResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('exam', 'title timeLimit')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.examResults = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.id })
      .populate('student', 'name email')
      .populate('exam', 'title')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.allResults = async (req, res) => {
  try {
    const results = await Result.find({})
      .populate('student', 'name email')
      .populate('exam', 'title')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminStats = async (req, res) => {
  try {
    const Exam = require('../models/Exam');
    const User = require('../models/User');
    const [totalExams, totalStudents, totalAttempts, agg] = await Promise.all([
      Exam.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      Result.countDocuments({}),
      Result.aggregate([
        { $group: { _id: null, avg: { $avg: '$percentage' } } },
      ]),
    ]);
    const avgScore = agg[0] ? Math.round(agg[0].avg) : 0;
    res.json({ totalExams, totalStudents, totalAttempts, avgScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
