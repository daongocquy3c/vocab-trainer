'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Page() {
  const [vocabList, setVocabList] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('add');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState(180);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [testTimeout, setTestTimeout] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('vocabList');
    if (saved) setVocabList(JSON.parse(saved));
    const savedScore = localStorage.getItem('scoreHistory');
    if (savedScore) setHistory(JSON.parse(savedScore));
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark) setDarkMode(JSON.parse(savedDark));
  }, []);

  useEffect(() => {
    localStorage.setItem('vocabList', JSON.stringify(vocabList));
  }, [vocabList]);

  useEffect(() => {
    localStorage.setItem('scoreHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleAdd = () => {
    if (input.includes(':')) {
      setVocabList([...vocabList, input.trim()]);
      setInput('');
    } else {
      alert('Format: word:meaning');
    }
  };

  const handleDelete = (index) => {
    if (confirm('Are you sure you want to delete this word?')) {
      const newList = [...vocabList];
      newList.splice(index, 1);
      setVocabList(newList);
    }
  };

  const startTest = () => {
    if (vocabList.length === 0) {
      alert('Add words first.');
      return;
    }
    setMode('test');
    setScore(0);
    setCurrentWordIndex(0);
    const timeout = setTimeout(() => {
      endTest();
    }, timeLimit * 1000);
    setTestTimeout(timeout);
  };

  const endTest = () => {
    if (testTimeout) clearTimeout(testTimeout);
    setMode('add');
    setHistory([...history, { date: new Date().toLocaleDateString(), score }]);
  };

  const playSound = (type) => {
    const sound = new Audio(type === 'correct' ? 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg' : 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
    sound.play();
  };

  const checkAnswer = () => {
    const [word, meaning] = vocabList[currentWordIndex].split(':').map(e => e.trim());
    if (answer.trim() === meaning) {
      setScore(score + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setAnswer('');
    if (currentWordIndex + 1 < vocabList.length) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen p-4 relative`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📘 Vocabulary Trainer</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="border rounded px-2 py-1">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {mode === 'add' && (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="word:meaning"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 w-full text-black"
            />
            <button onClick={handleAdd} className="mt-2 w-full bg-blue-500 text-white p-2 rounded">Add Word</button>
          </div>

          {vocabList.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Your Vocabulary List</h2>
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {vocabList.map((item, index) => (
                  <li key={index} className="flex justify-between items-center border p-2 rounded bg-gray-100 text-black">
                    <span>{item}</span>
                    <button onClick={() => handleDelete(index)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <input
              type="number"
              placeholder="Test time in seconds"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="border p-2 w-full text-black"
            />
            <button onClick={startTest} className="mt-2 w-full bg-green-500 text-white p-2 rounded">Start Test</button>
          </div>
          <div>
            <h2 className="font-semibold">Your Score History</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={history}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {mode === 'test' && (
        <div className="space-y-4">
          <p className="text-lg">Translate: <span className="font-semibold">{vocabList[currentWordIndex].split(':')[0]}</span></p>
          <input
            type="text"
            placeholder="Enter meaning in Vietnamese"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="border p-2 w-full text-black"
          />
          <button onClick={checkAnswer} className="bg-blue-500 text-white p-2 rounded w-full">Submit</button>
          <button onClick={endTest} className="bg-red-500 text-white p-2 rounded w-full">Stop Test</button>
          <p>Score: {score}</p>
        </div>
      )}

      {/* Fixed button bottom right for author and guide */}
      <button
        onClick={() => alert('Tác giả: Đào Ngọc Quý\n\nHướng dẫn:\n1️⃣ Thêm từ theo cú phát: từ_tiếng_anh:nghĩa, ví dụ: name:tên\n2️⃣ Chọn thời gian test\n3️⃣ Bắt đầu test và nhập nghĩa tiếng Việt\n4️⃣ App sẽ chấm điểm tự động và lưu lịch sử.')}
        className="fixed bottom-4 right-4 bg-gray-700 text-white px-3 py-2 rounded shadow-lg hover:bg-gray-800"
      >
        ℹ️ Guide
      </button>
    </div>
  );
}
