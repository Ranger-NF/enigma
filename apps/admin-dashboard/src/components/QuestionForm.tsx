import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { getQuestion, createQuestion, updateQuestion, uploadQuestionImage } from '../lib/firestoreService';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface QuestionFormProps {
  editingDay: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ editingDay, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(editingDay || 1);
  const [questionText, setQuestionText] = useState('');
  const [hint, setHint] = useState('');
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [unlockDate, setUnlockDate] = useState('2025-10-01');

  useEffect(() => {
    if (editingDay) {
      loadQuestion(editingDay);
    }
  }, [editingDay]);

  const loadQuestion = async (dayNum: number) => {
    try {
      const q = await getQuestion(dayNum);
      if (q) {
        setDay(q.day);
        setQuestionText(q.text);
        setHint(q.hint);
        setAnswer(q.answer);
        setDifficulty(q.difficulty);
        if (q.image) {
          setImagePreview(q.image);
        }
        const date = q.unlockDate.toDate();
        setUnlockDate(date.toISOString().split('T')[0]);
      }
    } catch (error) {
      toast.error('Failed to load question');
      console.error(error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim() || !answer.trim() || !hint.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = imagePreview;

      // Upload image if new one selected
      if (image) {
        imageUrl = await uploadQuestionImage(image, day);
      }

      const questionData = {
        day,
        text: questionText,
        hint,
        answer,
        difficulty,
        image: imageUrl || undefined,
        unlockDate: Timestamp.fromDate(new Date(unlockDate)),
      };

      if (editingDay) {
        await updateQuestion(day, questionData);
      } else {
        await createQuestion(day, questionData);
      }

      onSuccess();
    } catch (error) {
      toast.error('Failed to save question');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        {editingDay ? `Edit Day ${day}` : 'Create New Question'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Day (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={day}
              onChange={(e) => setDay(Math.min(10, Math.max(1, parseInt(e.target.value))))}
              disabled={!!editingDay}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white disabled:opacity-50"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Difficulty (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-slate-400 text-sm mt-1">★ {difficulty}/5</div>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Question Text *
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
            placeholder="Enter the question..."
          />
        </div>

        {/* Hint */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Hint *
          </label>
          <textarea
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
            placeholder="Enter a helpful hint..."
          />
        </div>

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Answer *
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
            placeholder="Enter the correct answer..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Question Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-600 rounded cursor-pointer hover:border-blue-500 transition">
              <div className="flex items-center gap-2 text-slate-400">
                <Upload className="w-5 h-5" />
                <span>Click to upload or drag & drop</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview('');
                }}
                className="p-2 text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 max-h-48 rounded object-cover"
            />
          )}
        </div>

        {/* Unlock Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Unlock Date
          </label>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
          >
            {loading ? 'Saving...' : editingDay ? 'Update Question' : 'Create Question'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
