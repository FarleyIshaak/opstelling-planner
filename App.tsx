import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';

const PLAYER_NAMES = ['A','B','C'];
const PART_TITLES = ['Verdediging','Midden','Aanval'];

export default function App() {
  const exportRef = useRef(null);
  const [benchCount, setBenchCount] = useState({A:0,B:0,C:0});
  const formations = [
    { field: ['A'], bench: ['B','C']},
    { field: ['B'], bench: ['A','C']},
    { field: ['C'], bench: ['A','B']}
  ];

  const renderField = (f) => (
    <div className="p-2 border rounded mb-2">
      {f.field.map(p=><div key={p}>{p}</div>)}
    </div>
  );

  const renderBench = (f) => (
    <div className="p-2 border rounded">
      {f.bench.map(p=><div key={p}>{p}</div>)}
    </div>
  );

  const downloadJPG = async () => {
    if (!exportRef.current) return;
    const dataUrl = await htmlToImage.toJpeg(exportRef.current,{quality:1});
    const link = document.createElement('a');
    link.download = "opstelling.jpg";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="p-4" ref={exportRef}>
      <h1>Opstelling Planner</h1>
      <div style={{display:'flex', gap:'1rem'}}>
        {formations.map((f,i)=>(
          <div key={i} style={{border:'1px solid #ddd', padding:'8px'}}>
            <h3>{PART_TITLES[i]}</h3>
            {renderField(f)}
            {renderBench(f)}
          </div>
        ))}
      </div>
      <button onClick={downloadJPG} style={{marginTop:'20px'}}>Download als JPG</button>
    </div>
  );
}
