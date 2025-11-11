import { useState, useEffect } from "react";
import { Plus, LogOut, Calendar } from "lucide-react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAllQuestions, Question } from "./lib/firestoreService";
import QuestionsGrid from "./components/QuestionsGrid";
import QuestionForm from "./components/QuestionForm";
import toast, { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import { getDoc, doc } from "firebase/firestore";
import { db } from "./lib/firebase";
import "./index.css";

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔐 Check auth + admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const adminRef = doc(db, "admins", "list");
        const snap = await getDoc(adminRef);
        const admins = snap.exists() ? snap.data().adminIds || [] : [];
        if (admins.includes(currentUser.uid)) {
          setUser(currentUser);
        } else {
          await signOut(auth);
          toast.error("Access denied. Not an admin.");
        }
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 📦 Load questions
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      toast.error("Failed to load questions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadQuestions();
  }, [user]);

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // ✅ After form submit
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDay(null);
    loadQuestions();
    toast.success(editingDay ? "Question updated!" : "Question created!");
  };

  // 🕓 Loading states
  if (checkingAuth)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!user) return <Login onLogin={setUser} />;

  // 🧠 Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">
              Enigma Admin Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Questions Management
            </h2>
            <p className="text-slate-400">
              Create, edit, and manage daily questions
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setEditingDay(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              <Plus className="w-5 h-5" />
              New Question
            </button>
          )}
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8">
            <QuestionForm
              editingDay={editingDay}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingDay(null);
              }}
            />
          </div>
        )}

        {/* Questions Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <QuestionsGrid
            questions={questions}
            onEdit={(day) => {
              setEditingDay(day);
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={() => loadQuestions()}
          />
        )}
      </main>
    </div>
  );
}

export default App;
