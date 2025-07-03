jsx
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
  const fileInputRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('vocabList');
    if (saved) setVocabList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('vocabList', JSON.stringify(vocabList));
  }, [vocabList]);

  const addWord = () => {
    if (!input.includes(':')) return alert('Use format word [:meaning]');
    setVocabList([...vocabList, { entry: input.trim(), tag: tag.trim() || 'General' }]);
    setInput('');
    setTag('');
  };

  const deleteWord = (index) => {
    if (!confirm('Delete this word?')) return;
    const updated = [...vocabList];
    updated.splice(index, 1);
    setVocabList(updated);
  };

  const startTest = () => {
    if (filteredList.length === 0) return alert('No words to test.');
    setScore(0);
    setCurrentIndex(0);
    setMode('test');
    speak(getCurrentWord());
  };

  const checkAnswer = () => {
    const parts = filteredList[currentIndex].entry.split(':');
    const meaning = parts[1] ? parts[1].trim().toLowerCase() : '';
    if (answer.trim().toLowerCase() === meaning) {
      setScore(score + 1);
      speak('Correct');
    } else {
      speak('Incorrect');
    }
    setAnswer('');
    if (currentIndex + 1 < filteredList.length) {
      setCurrentIndex(currentIndex + 1);
      speak(getWordAt(currentIndex + 1));
    } else {
      alert(`Done! Your score: ${score}/${filteredList.length}`);
      setMode('add');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
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

  const getCurrentWord = () => getWordAt(currentIndex);

  function getWordAt(index) {
    const parts = filteredList[index].entry.split(':')[0].trim();
    const phoneticMatch = parts.match(/(.*?)\s*\/(.*?)\//);
    if (phoneticMatch) {
      return phoneticMatch[1].trim();
    } else {
      return parts;
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">📘 Vocab Trainer</h1>
      {mode === 'add' && (
        <>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="word [:meaning]" className="border p-2 w-full" />
          <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag (optional)" className="border p-2 w-full" />
          <div className="flex space-x-2">
            <button onClick={addWord} className="bg-blue-500 text-white p-2 rounded flex-1">Add</button>
            <button onClick={startTest} className="bg-green-500 text-white p-2 rounded flex-1">Test</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => fileInputRef.current.click()} className="bg-yellow-500 text-white p-2 rounded flex-1">Import .txt</button>
            <button onClick={exportTxt} className="bg-purple-500 text-white p-2 rounded flex-1">Export .txt</button>
            <input ref={fileInputRef} type="file" accept=".txt" onChange={importTxt} className="hidden" />
          </div>
          <div>
            <label>Filter Tag:</label>
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="border p-2 w-full">
              <option>All</option>
              {[...new Set(vocabList.map(v => v.tag))].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={() => setShowList(!showList)} className="bg-gray-500 text-white p-2 rounded w-full">📄 {showList ? 'Hide' : 'Show'} Vocab List ({filteredList.length})</button>
          {showList && (
            <ul className="max-h-60 overflow-y-auto border p-2 rounded">
              {filteredList.map((v, i) => (
                <li key={i} className="flex justify-between border-b py-1">
                  <span>{v.entry} [{v.tag}]</span>
                  <button onClick={() => deleteWord(i)} className="text-red-500">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {mode === 'test' && (
        <>
          <p>Translate: <span className="font-bold">{(() => {
            const parts = filteredList[currentIndex].entry.split(':');
            const word = parts[0].trim();
            const phonetic = word.match(/\/(.*?)\//);
            return phonetic ? `${word} [/${phonetic[1]}/]` : word;
          })()}</span></p>
          <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your Answer" className="border p-2 w-full" />
          <button onClick={checkAnswer} className="bg-blue-500 text-white p-2 rounded w-full">Submit</button>
          <p>Score: {score} / {filteredList.length}</p>
        </>
      )}
    </div>
  );
}
