import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Question } from '../lib/firestoreService';

interface QuestionsGridProps {
  questions: Question[];
  onEdit: (day: number) => void;
  onDelete: () => void;
}

const QuestionsGrid: React.FC<QuestionsGridProps> = ({ questions, onEdit, onDelete }) => {
  const allDays = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allDays.map((day) => {
        const question = questions.find(q => q.day === day);

        return (
          <div
            key={day}
            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition"
          >
            {/* Day Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
              <h3 className="text-white font-bold text-lg">Day {day}</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              {question ? (
                <>
                  {/* Question Text Preview */}
                  <p className="text-slate-300 text-sm mb-3 line-clamp-3">
                    {question.text}
                  </p>

                  {/* Image Preview */}
                  {question.image && (
                    <img
                      src={question.image}
                      alt="Question"
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}

                  {/* Question Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-slate-700 rounded px-2 py-1">
                      <span className="text-slate-400">Difficulty:</span>
                      <p className="text-white font-semibold">{question.difficulty}/5</p>
                    </div>
                    <div className="bg-slate-700 rounded px-2 py-1">
                      <span className="text-slate-400">Answer:</span>
                      <p className="text-white font-semibold truncate">{question.answer}</p>
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-1">Hint:</p>
                    <p className="text-sm text-slate-300 line-clamp-2">{question.hint}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(day)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete Day ${day} question?`)) {
                          import('../lib/firestoreService').then(({ deleteQuestion }) => {
                            deleteQuestion(day).then(() => {
                              onDelete();
                              import('react-hot-toast').then(({ default: toast }) => {
                                toast.success('Question deleted!');
                              });
                            });
                          });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm mb-4">No question yet</p>
                  <button
                    onClick={() => onEdit(day)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
                  >
                    Create Question
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuestionsGrid;
