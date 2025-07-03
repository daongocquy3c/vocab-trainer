'use client';

import { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [vocabList, setVocabList] = useState([]);
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [mode, setMode] = useState('add');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showList, setShowList] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('vocabList');
    if (saved) setVocabList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('vocabList', JSON.stringify(vocabList));
  }, [vocabList]);

  const addWord = () => {
    if (!input.includes(':')) return alert('Dùng định dạng word[:meaning]');
    setVocabList([...vocabList, { entry: input.trim(), tag: tag.trim() || 'General' }]);
    setInput('');
    setTag('');
  };

  const deleteWord = (index) => {
    if (!confirm('Xoá từ này?')) return;
    const updated = [...vocabList];
    updated.splice(index, 1);
    setVocabList(updated);
  };

  const startTest = () => {
    if (filteredList.length === 0) return alert('Không có từ để test.');
    setScore(0);
    setCurrentIndex(0);
    setMode('test');
    speak(getWord(currentIndex));
  };

  const checkAnswer = () => {
    const [wordRaw, meaningRaw] = filteredList[currentIndex].entry.split(':');
    const meaning = (meaningRaw || '').trim().toLowerCase();
    if (answer.trim().toLowerCase() === meaning) {
      setScore(score + 1);
      speak('Correct');
    } else {
      speak('Incorrect');
    }
    setAnswer('');
    if (currentIndex + 1 < filteredList.length) {
      setCurrentIndex(currentIndex + 1);
      speak(getWord(currentIndex + 1));
    } else {
      alert(`Hoàn thành! Điểm: ${score}/${filteredList.length}`);
      setMode('add');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const getWord = (index) => {
    const wordRaw = filteredList[index].entry.split(':')[0].trim();
    const phoneticMatch = wordRaw.match(/^(.*?)\s*\/(.*?)\//);
    return phoneticMatch ? phoneticMatch[1].trim() : wordRaw;
  };

  const importTxt = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split('\n');
      const newWords = lines.filter(Boolean).map(line => {
        const [entry, tag = 'General'] = line.split('|');
        return { entry: entry.trim(), tag: tag.trim() };
      });
      setVocabList([...vocabList, ...newWords]);
    };
    reader.readAsText(file);
  };

  const exportTxt = () => {
    const content = vocabList.map(v => `${v.entry}|${v.tag}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vocab_list.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredList = filterTag === 'All' ? vocabList : vocabList.filter(v => v.tag === filterTag);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">📘 Vocab Trainer</h1>

      {mode === 'add' && (
        <>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="word[:meaning]" className="border p-2 w-full" />
          <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag (tuỳ chọn)" className="border p-2 w-full" />
          <div className="flex space-x-2">
            <button onClick={addWord} className="bg-blue-500 text-white p-2 rounded flex-1">Thêm</button>
            <button onClick={startTest} className="bg-green-500 text-white p-2 rounded flex-1">Bắt đầu Test</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => fileInputRef.current.click()} className="bg-yellow-500 text-white p-2 rounded flex-1">Import</button>
            <button onClick={exportTxt} className="bg-purple-500 text-white p-2 rounded flex-1">Export</button>
            <input ref={fileInputRef} type="file" accept=".txt" onChange={importTxt} className="hidden" />
          </div>
          <div>
            <label>Lọc theo Tag:</label>
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="border p-2 w-full">
              <option>All</option>
              {[...new Set(vocabList.map(v => v.tag))].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={() => setShowList(!showList)} className="bg-gray-600 text-white p-2 rounded w-full">{showList ? 'Ẩn' : 'Hiện'} Danh sách từ ({filteredList.length})</button>
          {showList && (
            <ul className="max-h-64 overflow-y-auto border p-2 rounded bg-white">
              {filteredList.map((v, i) => (
                <li key={i} className="flex justify-between border-b py-1 text-sm">
                  <span>{v.entry} [{v.tag}]</span>
                  <button onClick={() => deleteWord(i)} className="text-red-500">X</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {mode === 'test' && (
        <>
          <p>Hãy dịch: <span className="font-bold">{(() => {
            const wordRaw = filteredList[currentIndex].entry.split(':')[0].trim();
            const phonetic = wordRaw.match(/\/(.*?)\//);
            return phonetic ? `${wordRaw} [/${phonetic[1]}/]` : wordRaw;
          })()}</span></p>
          <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Nhập nghĩa" className="border p-2 w-full" />
          <button onClick={checkAnswer} className="bg-blue-500 text-white p-2 rounded w-full">Gửi</button>
          <p>Điểm: {score} / {filteredList.length}</p>
        </>
      )}

      <button onClick={() => setShowGuide(true)} className="fixed bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg">📘 Hướng dẫn</button>

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-sm w-full space-y-2">
            <h2 className="text-lg font-bold">📘 Hướng dẫn sử dụng</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Thêm từ: "từ [:nghĩa]" (VD: apple:quả táo)</li>
              <li>Có thể thêm phiên âm: "từ /ˈæp.əl/ [:nghĩa]"</li>
              <li>Dùng Tag để phân loại TOEIC, IELTS...</li>
              <li>Import/Export danh sách từ dạng txt</li>
              <li>Bắt đầu Test để luyện tập, phát âm tự động</li>
              <li>Xem, xoá từ trong danh sách từ đã thêm</li>
            </ul>
            <button onClick={() => setShowGuide(false)} className="bg-indigo-600 text-white p-2 rounded w-full">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}