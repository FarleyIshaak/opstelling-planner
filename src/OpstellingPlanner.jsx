// OpstellingPlanner.jsx – complete werkende versie

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

const PLAYER_NAMES = [
  "Boaz", "Imran", "Ryu", "Samar",
  "Liam", "Julian", "Milan",
  "Bodhi", "Daniel", "Rihan", "Jaylano"
];

const PARTS = 8;
const PART_TITLES = [
  "Kwart 1a", "Kwart 1b",
  "Kwart 2a", "Kwart 2b",
  "Kwart 3a", "Kwart 3b",
  "Kwart 4a", "Kwart 4b"
];

const FIELD_STRUCTURE = [1, 3, 3, 1]; // spits → midden → verdediging → keeper
const FIELD_SLOTS = 8;
const BENCH_SLOTS = 3;

export default function OpstellingPlanner() {
  const exportRef = useRef(null);

  const emptyFormation = () => ({
    field: Array(FIELD_SLOTS).fill(null),
    bench: Array(BENCH_SLOTS).fill(null),
  });

  const initFormations = () =>
    Array.from({ length: PARTS }, () => ({
      field: [
        "Bodhi",       // spits
        "Liam", "Julian", "Milan",   // middenveld
        "Imran", "Ryu", "Samar",     // verdediging
        "Boaz"         // keeper
      ],
      bench: ["Daniel", "Rihan", "Jaylano"],
    }));

  const [formations, setFormations] = useState(() => {
    const saved = localStorage.getItem("opstelling_v6");
    return saved ? JSON.parse(saved) : initFormations();
  });

  const [dragData, setDragData] = useState(null);

  useEffect(() => {
    localStorage.setItem("opstelling_v6", JSON.stringify(formations));
  }, [formations]);

  const updateFormation = (idx, newForm) => {
    setFormations(prev => prev.map((f, i) => i === idx ? newForm : f));
  };

  const onDragStart = (part, area, index, player) => {
    if (!player) return;
    setDragData({ part, area, index, player });
  };

  const onDrop = (targetPart, targetArea, targetIndex) => {
    if (!dragData) return;

    const { part: originPart, area: originArea, index: originIndex, player } = dragData;

    const newFormations = formations.map(f => ({
      field: [...f.field],
      bench: [...f.bench],
    }));

    const originForm = newFormations[originPart];
    const targetForm = newFormations[targetPart];

    const originList = originArea === "field" ? originForm.field : originForm.bench;
    const targetList = targetArea === "field" ? targetForm.field : targetForm.bench;

    const swapped = targetList[targetIndex];

    targetList[targetIndex] = player;
    originList[originIndex] = swapped;

    setFormations(newFormations);
    setDragData(null);
  };

  const boxClass = "w-20 h-10 md:w-24 md:h-12";

  const renderField = (formation, partIndex) => {
    let slot = 0;

    return (
      <div className="flex flex-col gap-1 bg-green-600/10 p-1 rounded">
        {FIELD_STRUCTURE.map((count, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {Array.from({ length: count }).map((_, i) => {
              const s = slot;
              const player = formation.field[s];
              slot++;

              return (
                <div
                  key={s}
                  draggable={!!player}
                  onDragStart={() => onDragStart(partIndex, "field", s, player)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(partIndex, "field", s)}
                  className={`${boxClass} flex items-center justify-center text-center rounded bg-white shadow cursor-move select-none text-[12px]`}
                >
                  <div className="truncate w-full text-center">{player ?? "—"}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderBench = (formation, partIndex) => (
    <div className="flex gap-1 mt-1">
      {formation.bench.map((player, bIdx) => (
        <div
          key={bIdx}
          draggable={!!player}
          onDragStart={() => onDragStart(partIndex, "bench", bIdx, player)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(partIndex, "bench", bIdx)}
          className={`${boxClass} flex items-center justify-center text-center rounded bg-gray-100 shadow text-[12px]`}
        >
          <div className="truncate w-full text-center">{player ?? "—"}</div>
        </div>
      ))}
    </div>
  );

  const benchCount = Object.fromEntries(PLAYER_NAMES.map(p => [p, 0]));
  formations.forEach(f => f.bench.forEach(p => p && benchCount[p]++));

  const exportJPG = async () => {
    if (!exportRef.current) return;

    const canvas = await html2canvas(exportRef.current);
    const dataURL = canvas.toDataURL("image/jpeg");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "opstelling.jpg";
    link.click();
  };

  return (
    <>
      <button
        onClick={exportJPG}
        className="mb-3 px-3 py-1 rounded bg-blue-500 text-white shadow"
      >
        Download als JPG
      </button>

      <div className="p-3 max-w-7xl mx-auto" ref={exportRef}>
        <h1 className="text-lg font-bold mb-3">Opstelling Planner – 1-3-3-1 (Compact)</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {formations.map((f, i) => (
            <div key={i} className="bg-white p-2 rounded shadow">
              <h2 className="font-semibold mb-1 text-center text-sm">{PART_TITLES[i]}</h2>
              {renderField(f, i)}
              {renderBench(f, i)}
            </div>
          ))}
        </div>

        <div className="mt-4 p-2 bg-gray-100 rounded shadow text-xs">
          <div className="flex gap-2 flex-wrap">
            {PLAYER_NAMES.map(p => (
              <div key={p} className="px-2 py-1 bg-white rounded shadow-sm text-[12px]">
                {p}: <strong>{benchCount[p]}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
