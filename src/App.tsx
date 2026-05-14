/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Plus, BookOpen, Music, Trash2, Download, Play, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppState, AudioExercise, EditorState, Question } from "./types";
import { generateStandaloneHTML } from "./lib/exportTemplate";

export default function App() {
  const [view, setView] = useState<AppState>('dashboard');
  const [exercises, setExercises] = useState<AudioExercise[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('audio_edu_exercises');
    if (saved) {
      try {
        setExercises(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved exercises", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('audio_edu_exercises', JSON.stringify(exercises));
  }, [exercises]);

  const createNewExercise = () => {
    const newEx: AudioExercise = {
      id: crypto.randomUUID(),
      title: "Nuovo Esercizio",
      description: "",
      script: "",
      comprehensionQuestions: [],
      createdAt: Date.now(),
    };
    setEditor({ step: 'setup', exercise: newEx });
    setView('editor');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];
        setEditor({
          ...editor,
          exercise: { ...editor.exercise, audioBase64: base64Data }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];
        const newEx: AudioExercise = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          script: "",
          audioBase64: base64Data,
          comprehensionQuestions: [],
          createdAt: Date.now(),
        };
        setEditor({ step: 'setup', exercise: newEx });
        setView('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const exportExercise = (exercise: AudioExercise) => {
    const html = generateStandaloneHTML(exercise);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exercise.title.replace(/\s+/g, '_')}_esercizio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-natural-bg text-natural-text font-sans p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-serif font-bold text-natural-heading flex items-center gap-3">
                <div className="w-12 h-12 bg-natural-olive rounded-xl flex items-center justify-center text-white shadow-lg shadow-natural-olive/20">
                  <Music className="h-6 w-6" />
                </div>
                AudioEdu Creator
              </h1>
              <p className="text-natural-muted text-lg italic font-serif">Crea esercizi audio interattivi con toni naturali.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="cursor-pointer bg-white border-2 border-natural-olive text-natural-olive px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all hover:bg-natural-paper">
                <Music className="h-5 w-5" />
                Carica MP3
                <input type="file" accept="audio/mpeg" onChange={handleQuickUpload} className="hidden" />
              </label>
              <button
                onClick={createNewExercise}
                className="bg-natural-olive hover:bg-natural-olive/90 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg shadow-natural-olive/20"
              >
                <Plus className="h-5 w-5" />
                Crea Nuovo
              </button>
            </div>
          </header>

          {/* Stats / Intro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-natural-border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 bg-natural-paper rounded-xl flex items-center justify-center">
                <BookOpen className="text-natural-olive h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-natural-heading">{exercises.length}</p>
                <p className="text-natural-muted text-xs uppercase tracking-widest font-bold">Esercizi totali</p>
              </div>
            </div>
          </div>

          {/* List */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-natural-muted font-bold">I tuoi Esercizi</h2>
            {exercises.length === 0 ? (
              <div className="bg-natural-paper border-2 border-dashed border-natural-border rounded-[2rem] p-16 text-center space-y-4">
                <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Play className="text-natural-border h-10 w-10" />
                </div>
                <div className="space-y-1 font-serif">
                  <p className="text-natural-heading font-bold text-xl">Nessun progetto audio</p>
                  <p className="text-natural-muted italic">Inizia a comporre il tuo materiale didattico.</p>
                </div>
                <button
                  onClick={createNewExercise}
                  className="text-natural-olive font-bold hover:underline"
                >
                  Nuovo Audio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {exercises.map((ex) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={ex.id}
                      className="bg-white p-8 rounded-3xl border border-natural-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-serif font-bold text-natural-heading group-hover:text-natural-olive transition-colors">{ex.title}</h3>
                          <p className="text-natural-muted line-clamp-1 italic text-sm">{ex.description || "Nessuna descrizione"}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditor({ step: 'setup', exercise: ex });
                              setView('editor');
                            }}
                            className="p-2 hover:bg-natural-paper rounded-full text-natural-muted hover:text-natural-olive transition-all"
                            title="Modifica"
                          >
                            <BookOpen className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteExercise(ex.id)}
                            className="p-2 hover:bg-red-50 rounded-full text-natural-muted hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-natural-border/50 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-natural-sand rounded-full animate-pulse" />
                          <span className="text-[10px] text-natural-muted uppercase tracking-widest font-bold">
                            Modificato {new Date(ex.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => exportExercise(ex)}
                          className="flex items-center gap-2 text-xs font-bold text-natural-olive bg-natural-paper px-5 py-2.5 rounded-full hover:bg-natural-bg transition-colors border border-natural-border/30"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Esporta HTML
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  if (view === 'editor' && editor) {
    const { step, exercise } = editor;

    const nextStep = () => {
      const steps: Record<typeof step, typeof step> = {
        'setup': 'script',
        'script': 'questions',
        'questions': 'quiz',
        'quiz': 'preview',
        'preview': 'preview'
      };
      setEditor({ ...editor, step: steps[step] });
    };

    const prevStep = () => {
      const steps: Record<typeof step, typeof step> = {
        'setup': 'setup',
        'script': 'setup',
        'questions': 'script',
        'quiz': 'questions',
        'preview': 'quiz'
      };
      setEditor({ ...editor, step: steps[step] });
    };

    const saveAndClose = () => {
      setExercises(prev => {
        const exists = prev.find(e => e.id === exercise.id);
        if (exists) {
          return prev.map(e => e.id === exercise.id ? exercise : e);
        }
        return [...prev, exercise];
      });
      setView('dashboard');
      setEditor(null);
    };

    const updateExercise = (updates: Partial<AudioExercise>) => {
      setEditor({
        ...editor,
        exercise: { ...exercise, ...updates }
      });
    };

    const handleGenerateScript = () => {
      nextStep();
    };

    const handleGenerateQuestions = () => {
      nextStep();
    };

    const handleGenerateAudio = () => {
      // Logic handled via handleFileUpload
    };

    return (
      <div className="min-h-screen bg-natural-bg text-natural-text font-sans flex flex-col">
        {/* Editor Nav */}
        <nav className="border-b border-natural-border px-8 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button onClick={saveAndClose} className="p-2 hover:bg-natural-paper rounded-full transition-colors border border-natural-border">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-widest text-natural-muted font-bold">In redazione</p>
              <h1 className="font-serif font-bold text-xl text-natural-heading">{exercise.title || "Senza Titolo"}</h1>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={saveAndClose} className="px-6 py-2 bg-natural-paper text-natural-olive rounded-full font-bold text-sm border border-natural-border hover:bg-white transition-all">
              Chiudi
            </button>
            <button onClick={saveAndClose} className="bg-natural-olive text-white px-8 py-2 rounded-full font-bold text-sm shadow-lg shadow-natural-olive/20 hover:opacity-90 transition-all">
              Salva
            </button>
          </div>
        </nav>

        {/* Steps Progress */}
        <div className="border-b border-natural-border bg-natural-paper/30 p-4 overflow-x-auto">
          <div className="flex justify-center items-center gap-6 max-w-4xl mx-auto min-w-max">
            {['Configura', 'Componi', 'Domande', 'Quiz', 'Finalizza'].map((s, i) => {
              const isActive = (
                (step === 'setup' && i === 0) ||
                (step === 'script' && i === 1) ||
                (step === 'questions' && i === 2) ||
                (step === 'quiz' && i === 3) ||
                (step === 'preview' && i === 4)
              );
              const isPast = (
                (step === 'script' && i < 1) ||
                (step === 'questions' && i < 2) ||
                (step === 'quiz' && i < 3) ||
                (step === 'preview' && i < 4)
              );
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-natural-olive text-white shadow-md' : isPast ? 'bg-natural-sand text-white' : 'bg-white border border-natural-border text-natural-muted'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs uppercase tracking-widest font-bold ${isActive ? 'text-natural-olive' : 'text-natural-muted'}`}>{s}</span>
                  {i < 4 && <div className="h-px w-8 bg-natural-border mx-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16 bg-natural-bg">
          <div className="max-w-4xl mx-auto">
            {step === 'setup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-natural-border space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-serif font-bold text-natural-heading">Inizia il tuo Progetto</h2>
                    <p className="text-natural-muted italic">Definisci l'identità del tuo esercizio audio.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-natural-sand/10 border border-natural-sand/30 p-6 rounded-3xl">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${exercise.audioBase64 ? 'bg-green-500' : 'bg-natural-sand'}`}>
                          <Music className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-natural-heading">{exercise.audioBase64 ? "Audio Caricato" : "Nessun Audio"}</p>
                          <p className="text-xs text-natural-muted italic">Carica il file MP3 per iniziare</p>
                        </div>
                      </div>
                      <label className="cursor-pointer px-6 py-3 bg-natural-olive text-white rounded-full font-bold text-sm shadow-md hover:bg-natural-olive/90 transition-all">
                        {exercise.audioBase64 ? "Cambia MP3" : "Scegli File MP3"}
                        <input type="file" accept="audio/mpeg" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Titolo Professionale</label>
                      <input
                        type="text"
                        value={exercise.title}
                        onChange={(e) => updateExercise({ title: e.target.value })}
                        className="w-full text-2xl font-serif font-bold p-6 bg-natural-paper rounded-2xl border border-natural-border focus:border-natural-olive outline-none transition-all placeholder:text-natural-border"
                        placeholder="Es: Conversazione in Galleria..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Obiettivi Didattici</label>
                      <textarea
                        value={exercise.description}
                        onChange={(e) => updateExercise({ description: e.target.value })}
                        className="w-full p-6 bg-natural-paper rounded-2xl border border-natural-border focus:border-natural-olive outline-none transition-all h-40 italic"
                        placeholder="Quali competenze copre questo ascolto?"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateScript}
                    className="w-full bg-natural-olive text-white p-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-natural-olive/90 transition-all shadow-xl shadow-natural-olive/20"
                  >
                    Prosegui alla Trascrizione
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'script' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-natural-border space-y-8">
                  <header className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-serif font-bold text-natural-heading">Audio e Trascrizione</h2>
                      <p className="text-natural-muted text-sm italic">Carica il tuo file MP3 e scrivi il testo dell'ascolto.</p>
                    </div>
                    <label className="cursor-pointer px-6 py-3 bg-natural-sand text-white rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:opacity-90">
                      <Music className="h-4 w-4" />
                      {exercise.audioBase64 ? "Sostituisci MP3" : "Carica MP3"}
                      <input type="file" accept="audio/mpeg" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </header>

                  {exercise.audioBase64 && (
                    <div className="p-8 bg-natural-paper rounded-3xl border border-natural-border flex items-center gap-6">
                       <div className="w-12 h-12 bg-natural-olive rounded-full flex items-center justify-center text-white shrink-0">
                          <Play className="h-5 w-5 fill-current" />
                       </div>
                       <audio controls className="flex-1 filter grayscale invert opacity-80">
                          <source src={`data:audio/mpeg;base64,${exercise.audioBase64}`} type="audio/mpeg" />
                       </audio>
                    </div>
                  )}

                  <textarea
                    value={exercise.script}
                    onChange={(e) => updateExercise({ script: e.target.value })}
                    className="w-full p-8 bg-natural-paper rounded-3xl border border-natural-border focus:border-natural-olive outline-none transition-all h-[30rem] font-serif text-lg leading-relaxed shadow-inner"
                  />
                  
                  <div className="flex gap-4">
                    <button onClick={prevStep} className="px-8 py-4 rounded-full font-bold border border-natural-border bg-white text-natural-muted hover:bg-natural-paper transition-all">Indietro</button>
                    <button
                      onClick={handleGenerateQuestions}
                      className="flex-1 bg-natural-olive text-white p-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-natural-olive/90 transition-all"
                    >
                      Prosegui alle Domande
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'questions' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <header className="flex justify-between items-center bg-white/50 p-6 rounded-3xl border border-natural-border">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-serif font-bold text-natural-heading">Analisi e Comprensione</h2>
                    <p className="text-natural-muted text-sm italic">Verifica la comprensione dell'ascolto.</p>
                  </div>
                  <button
                    onClick={() => {
                       const newQ: Question = { 
                         id: crypto.randomUUID(), 
                         type: 'multiple_choice',
                         text: "Nuova domanda...", 
                         options: ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"], 
                         correctAnswer: 0 
                       };
                       updateExercise({ comprehensionQuestions: [...exercise.comprehensionQuestions, newQ] });
                    }}
                    className="bg-natural-olive text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md"
                  >
                    + Aggiungi
                  </button>
                </header>

                <div className="space-y-6">
                  {exercise.comprehensionQuestions.map((q, qIdx) => (
                    <motion.div layout key={q.id} className="bg-white p-10 rounded-[2.5rem] border border-natural-border shadow-sm space-y-6 group relative">
                       <span className="absolute -left-4 top-10 bg-natural-sand text-white text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-md">DOMANDA {qIdx + 1}</span>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                         <input
                          type="text"
                          value={q.text}
                          onChange={(e) => {
                            const newQs = [...exercise.comprehensionQuestions];
                            newQs[qIdx].text = e.target.value;
                            updateExercise({ comprehensionQuestions: newQs });
                          }}
                          className="flex-1 font-serif text-2xl font-bold bg-transparent border-b-2 border-natural-paper focus:border-natural-sand outline-none py-2"
                          placeholder="Inserisci la domanda..."
                        />
                        <select 
                          value={q.type || 'multiple_choice'}
                          onChange={(e) => {
                            const newType = e.target.value as QuestionType;
                            const newQs = [...exercise.comprehensionQuestions];
                            newQs[qIdx].type = newType;
                            if (newType === 'true_false') {
                              newQs[qIdx].options = ['Vero', 'Falso'];
                              newQs[qIdx].correctAnswer = 0;
                            } else if (newType === 'short_answer') {
                              newQs[qIdx].options = [];
                              newQs[qIdx].correctAnswer = "";
                            } else {
                              newQs[qIdx].options = ['Opzione 1', 'Opzione 2', 'Opzione 3', 'Opzione 4'];
                              newQs[qIdx].correctAnswer = 0;
                            }
                            updateExercise({ comprehensionQuestions: newQs });
                          }}
                          className="bg-natural-paper p-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-natural-border outline-none"
                        >
                          <option value="multiple_choice">Scelta Multipla</option>
                          <option value="true_false">Vero/Falso</option>
                          <option value="short_answer">Risposta Breve</option>
                        </select>
                        <button 
                          onClick={() => updateExercise({ comprehensionQuestions: exercise.comprehensionQuestions.filter((_, i) => i !== qIdx) })}
                          className="p-2 text-natural-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {q.type === 'short_answer' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Risposta Corretta (Testo)</label>
                          <input 
                            type="text"
                            value={String(q.correctAnswer)}
                            onChange={(e) => {
                              const newQs = [...exercise.comprehensionQuestions];
                              newQs[qIdx].correctAnswer = e.target.value;
                              updateExercise({ comprehensionQuestions: newQs });
                            }}
                            className="w-full p-4 bg-natural-paper rounded-2xl border border-natural-border focus:border-natural-olive outline-none"
                            placeholder="Inserisci la risposta esatta..."
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${q.correctAnswer === optIdx ? 'bg-natural-olive/5 border-natural-olive' : 'bg-natural-paper border-transparent'}`}>
                               <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => {
                                  const newQs = [...exercise.comprehensionQuestions];
                                  newQs[qIdx].correctAnswer = optIdx;
                                  updateExercise({ comprehensionQuestions: newQs });
                                }}
                                className="accent-natural-olive w-5 h-5"
                              />
                              <input
                                type="text"
                                value={opt}
                                disabled={q.type === 'true_false'}
                                onChange={(e) => {
                                  const newQs = [...exercise.comprehensionQuestions];
                                  newQs[qIdx].options[optIdx] = e.target.value;
                                  updateExercise({ comprehensionQuestions: newQs });
                                }}
                                className="flex-1 bg-transparent text-sm font-medium outline-none disabled:opacity-50"
                                placeholder={`Opzione ${optIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4 pt-10">
                  <button onClick={prevStep} className="px-10 py-5 rounded-full font-bold border border-natural-border bg-white text-natural-muted">Indietro</button>
                  <button onClick={nextStep} className="flex-1 bg-natural-olive text-white p-5 rounded-full font-bold shadow-xl shadow-natural-olive/10">Prosegui al Quiz Finale</button>
                </div>
              </motion.div>
            )}

            {step === 'quiz' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-natural-olive p-12 rounded-[3rem] text-white shadow-2xl shadow-natural-olive/20 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold uppercase tracking-tight">Quiz Finale</h2>
                    <p className="opacity-70 italic text-sm font-serif">Crea una sfida finale con domande diverse per consolidare l'apprendimento.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        const newQ: Question = { 
                          id: crypto.randomUUID(), 
                          type: 'multiple_choice',
                          text: "Nuova sfida...", 
                          options: ["Opzione A", "Opzione B", "Opzione C", "Opzione D"], 
                          correctAnswer: 0 
                        };
                        const currentQuiz = exercise.finalQuiz || { id: crypto.randomUUID(), title: "Quiz Finale", questions: [] };
                        updateExercise({ 
                          finalQuiz: { ...currentQuiz, questions: [...currentQuiz.questions, newQ] } 
                        });
                      }}
                      className="bg-white text-natural-olive px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:bg-natural-paper transition-all"
                    >
                      + Aggiungi Domanda al Quiz
                    </button>
                    <button 
                      onClick={() => {
                        const clonedQuestions = JSON.parse(JSON.stringify(exercise.comprehensionQuestions));
                        const currentQuiz = exercise.finalQuiz || { id: crypto.randomUUID(), title: "Quiz Finale", questions: [] };
                        updateExercise({ 
                          finalQuiz: { ...currentQuiz, questions: [...currentQuiz.questions, ...clonedQuestions] } 
                        });
                      }}
                      className="bg-white/10 text-white border border-white/30 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                      Copia da Comprensione
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {(exercise.finalQuiz?.questions || []).map((q, qIdx) => (
                    <motion.div layout key={q.id} className="bg-white p-10 rounded-[2.5rem] border border-natural-border shadow-sm space-y-6 group relative">
                       <span className="absolute -left-4 top-10 bg-natural-olive text-white text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-md">QUIZ {qIdx + 1}</span>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                         <input
                          type="text"
                          value={q.text}
                          onChange={(e) => {
                            const newQs = [...(exercise.finalQuiz?.questions || [])];
                            newQs[qIdx].text = e.target.value;
                            updateExercise({ finalQuiz: { ...exercise.finalQuiz!, questions: newQs } });
                          }}
                          className="flex-1 font-serif text-2xl font-bold bg-transparent border-b-2 border-natural-paper focus:border-natural-olive outline-none py-2"
                          placeholder="Inserisci la domanda del quiz..."
                        />
                        <select 
                          value={q.type || 'multiple_choice'}
                          onChange={(e) => {
                            const newType = e.target.value as QuestionType;
                            const newQs = [...(exercise.finalQuiz?.questions || [])];
                            newQs[qIdx].type = newType;
                            if (newType === 'true_false') {
                              newQs[qIdx].options = ['Vero', 'Falso'];
                              newQs[qIdx].correctAnswer = 0;
                            } else if (newType === 'short_answer') {
                              newQs[qIdx].options = [];
                              newQs[qIdx].correctAnswer = "";
                            } else {
                              newQs[qIdx].options = ['Opzione 1', 'Opzione 2', 'Opzione 3', 'Opzione 4'];
                              newQs[qIdx].correctAnswer = 0;
                            }
                            updateExercise({ finalQuiz: { ...exercise.finalQuiz!, questions: newQs } });
                          }}
                          className="bg-natural-paper p-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-natural-border outline-none"
                        >
                          <option value="multiple_choice">Scelta Multipla</option>
                          <option value="true_false">Vero/Falso</option>
                          <option value="short_answer">Risposta Breve</option>
                        </select>
                        <button 
                          onClick={() => {
                            const newQs = (exercise.finalQuiz?.questions || []).filter((_, i) => i !== qIdx);
                            updateExercise({ finalQuiz: { ...exercise.finalQuiz!, questions: newQs } });
                          }}
                          className="p-2 text-natural-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {q.type === 'short_answer' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Risposta Corretta del Quiz</label>
                          <input 
                            type="text"
                            value={String(q.correctAnswer)}
                            onChange={(e) => {
                              const newQs = [...(exercise.finalQuiz?.questions || [])];
                              newQs[qIdx].correctAnswer = e.target.value;
                              updateExercise({ finalQuiz: { ...exercise.finalQuiz!, questions: newQs } });
                            }}
                            className="w-full p-4 bg-natural-paper rounded-2xl border border-natural-border focus:border-natural-olive outline-none"
                            placeholder="Inserisci la risposta esatta..."
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${q.correctAnswer === optIdx ? 'bg-natural-olive/5 border-natural-olive' : 'bg-natural-paper border-transparent'}`}>
                               <input
                                type="radio"
                                name={`correct-quiz-${q.id}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => {
                                  const newQs = [...(exercise.finalQuiz?.questions || [])];
                                  newQs[qIdx].correctAnswer = optIdx;
                                  updateExercise({ finalQuiz: { ...exercise.finalQuiz!, questions: newQs } });
                                }}
                                className="accent-natural-olive w-5 h-5"
                              />
                              <input
                                type="text"
                                value={opt}
                                disabled={q.type === 'true_false'}
                                onChange={(e) => {
                                  const newQs = [...(exercise.finalQuiz?.questions || [])];
                                  newQs[qIdx].options[optIdx] = e.target.value;
                                  updateExercise({ finalQuiz: { ...exercise.finalQuiz!, questions: newQs } });
                                }}
                                className="flex-1 bg-transparent text-sm font-medium outline-none disabled:opacity-50"
                                placeholder={`Opzione ${optIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="px-10 py-5 rounded-full font-bold border border-natural-border bg-white text-natural-muted">Indietro</button>
                  <button onClick={nextStep} className="flex-1 bg-natural-olive text-white p-5 rounded-full font-bold">Anteprima Finale</button>
                </div>
              </motion.div>
            )}

            {step === 'preview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-natural-sand/10 border border-natural-sand/30 p-6 rounded-3xl flex items-center gap-4">
                  <Play className="h-6 w-6 text-natural-sand shrink-0" />
                  <p className="text-natural-sand text-sm font-medium">Capolavoro pronto! Controlla l'esperienza finale prima di esportare il file standalone.</p>
                </div>
                
                <div className="bg-white p-16 rounded-[3rem] shadow-xl border border-natural-border space-y-12">
                  <header className="text-center space-y-4">
                     <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-natural-muted">Progetto Educativo</p>
                     <h1 className="text-5xl font-serif font-bold text-natural-heading italic tracking-tight">{exercise.title}</h1>
                     <div className="w-24 h-1 bg-natural-sand mx-auto rounded-full" />
                     <p className="text-natural-text max-w-xl mx-auto italic font-serif text-lg leading-relaxed">{exercise.description}</p>
                  </header>

                  {exercise.audioBase64 && (
                    <div className="p-8 bg-natural-paper rounded-[2rem] border border-natural-border">
                       <audio controls className="w-full filter grayscale invert opacity-70">
                          <source src={`data:audio/mpeg;base64,${exercise.audioBase64}`} type="audio/mpeg" />
                       </audio>
                    </div>
                  )}

                  <div className="space-y-8">
                    <h3 className="text-xs uppercase tracking-[0.3em] font-black text-natural-muted text-center">Domande di Comprensione</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exercise.comprehensionQuestions.map((q, i) => (
                        <div key={q.id} className="p-6 bg-natural-paper rounded-2xl border border-natural-border flex flex-col justify-between">
                          <p className="font-serif font-bold text-lg mb-4 text-natural-heading">{i+1}. {q.text}</p>
                          <div className="space-y-2">
                            {q.options.map((o, io) => (
                              <div key={io} className={`text-xs px-3 py-1.5 rounded-lg border ${io === q.correctAnswer ? 'bg-natural-olive text-white border-transparent' : 'bg-white border-natural-border/50 opacity-60'}`}>
                                {o}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button onClick={prevStep} className="px-10 py-5 rounded-full font-bold border border-natural-border bg-white text-natural-muted">Pensa ancora</button>
                  <button 
                    onClick={() => exportExercise(exercise)}
                    className="flex-1 bg-natural-olive text-white p-5 rounded-full font-bold flex items-center justify-center gap-3 shadow-2xl shadow-natural-olive/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Download className="h-6 w-6 text-natural-sand" />
                    Scarica Esercizio Standalone (HTML)
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
