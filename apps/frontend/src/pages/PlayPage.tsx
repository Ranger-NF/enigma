import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function PlayPage() {
  const { user } = useAuth();
  const [questionId, setQuestionId] = useState(""); // ✅ Add this to store the question ID
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch question on load
    const fetchQuestion = async () => {
      try {
        const token = await user?.getIdToken();
        const response = await fetch("http://localhost:5000/play", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setQuestionId(data.id); // ✅ Store the question ID
        setQuestion(data.question);
        setHint(data.hint);
      } catch (error) {
        console.error("Error fetching question:", error);
        setResult("Error loading question");
      }
    };

    if (user) {
      fetchQuestion();
    }
  }, [user]);

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch("http://localhost:5000/play/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: questionId, answer }), // ✅ Use the actual question ID
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setResult("Error submitting answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Navbar01 navigationLinks={[
        { href: '/', label: 'Home' },
        { href: '/rules', label: 'Rules' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/', label: 'Contact' },
      ]} />
      
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <h2 className="text-3xl font-bold text-white mb-4">{question}</h2>
        <p className="text-lg text-gray-300">Hint: {hint}</p>
        
        <div className="space-y-4">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={submitAnswer}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
        
        {result && (
          <p className="text-lg font-semibold text-white p-4 bg-gray-800 rounded-lg">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}

export default PlayPage;