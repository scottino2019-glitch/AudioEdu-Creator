/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioExercise } from "../types";

export function generateStandaloneHTML(exercise: AudioExercise): string {
  const { title, description, script, audioBase64, comprehensionQuestions, finalQuiz } = exercise;

  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #fdfbf7; color: #3d3d3a; }
        .serif { font-family: 'Playfair Display', serif; }
        .card { background: white; border-radius: 1.5rem; border: 1px solid #e5e2db; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .btn-primary { background-color: #5A5A40; color: white; border-radius: 9999px; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .hidden { display: none; }
    </style>
</head>
<body class="p-6 md:p-12 min-h-screen">
    <div class="max-w-3xl mx-auto space-y-12">
        <!-- Header -->
        <header class="text-center space-y-4">
            <p class="text-[10px] uppercase font-bold tracking-[0.4em] text-[#8a867e]">Progetto Educativo</p>
            <h1 class="text-5xl serif font-bold text-[#2d2d2a] italic tracking-tight">${title}</h1>
            <div class="w-20 h-1 bg-[#d1a27e] mx-auto rounded-full"></div>
            <p class="text-lg italic text-[#8a867e] serif leading-relaxed">${description}</p>
        </header>

        <!-- Audio Player -->
        <div class="card p-8 bg-[#f9f7f2]/50">
            <h2 class="text-xs uppercase tracking-widest font-black text-[#8a867e] mb-6 flex items-center gap-3">
                <span class="w-8 h-8 bg-[#5A5A40] rounded-full flex items-center justify-center text-white text-[10px]">🔊</span> 
                Sessione di Ascolto
            </h2>
            ${audioBase64 ? `
                <audio controls class="w-full filter grayscale opacity-80">
                    <source src="data:audio/mpeg;base64,${audioBase64}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            ` : '<p class="text-slate-400 italic">Audio non disponibile.</p>'}
            
            <button onclick="toggleScript()" class="mt-6 text-[#5A5A40] font-bold hover:underline text-xs uppercase tracking-widest">
                Mostra/Nascondi Trascrizione
            </button>
            <div id="script-container" class="hidden mt-6 p-8 bg-white rounded-2xl border border-[#e5e2db] text-[#3d3d3a] serif text-lg leading-relaxed whitespace-pre-wrap shadow-inner">
                ${script}
            </div>
        </div>

        <!-- Comprehension Questions -->
        <div class="space-y-8">
            <h2 class="text-xs uppercase tracking-[0.3em] font-black text-[#8a867e] text-center">Analisi e Comprensione</h2>
            <div class="grid gap-6">
                ${comprehensionQuestions.map((q, i) => `
                    <div class="card p-8 relative overflow-hidden">
                        <span class="absolute -left-3 top-6 bg-[#d1a27e] text-white text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-md">Q${i + 1}</span>
                        <p class="serif font-bold text-xl mb-6 ml-4">${q.text}</p>
                        <div class="grid gap-3">
                            ${(q.type || 'multiple_choice') === 'short_answer' ? `
                                <div class="flex gap-2">
                                    <input 
                                        type="text" 
                                        id="q-${i}-input" 
                                        class="flex-1 p-4 rounded-xl border border-[#f0ede6] bg-[#fdfbf7] focus:border-[#5A5A40] outline-none" 
                                        placeholder="Scrivi qui la risposta..."
                                    >
                                    <button 
                                        onclick="checkShortAnswer(${i}, '${q.correctAnswer}')"
                                        id="q-${i}-btn"
                                        class="px-6 bg-[#5A5A40] text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                                    >
                                        Controlla
                                    </button>
                                </div>
                            ` : `
                                ${q.options.map((opt, optIdx) => `
                                    <button 
                                        onclick="checkAnswer(${i}, ${optIdx}, ${q.correctAnswer})"
                                        id="q-${i}-opt-${optIdx}"
                                        class="text-left p-4 rounded-xl border border-[#f0ede6] bg-[#fdfbf7] hover:border-[#5A5A40] transition-all text-sm font-medium"
                                    >
                                        ${opt}
                                    </button>
                                `).join('')}
                            `}
                        </div>
                        <div id="feedback-${i}" class="hidden mt-6 p-4 rounded-xl text-sm font-bold serif italic"></div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Final Quiz -->
        ${finalQuiz && finalQuiz.questions.length > 0 ? `
            <div id="quiz-section" class="card p-12 bg-[#5A5A40] text-white border-none shadow-2xl shadow-[#5A5A40]/30 overflow-hidden relative">
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <h2 class="text-3xl serif font-bold italic mb-4 relative z-10">${finalQuiz.title}</h2>
                <div id="quiz-content" class="relative z-10">
                    <p class="opacity-80 mb-8 serif text-lg italic">Metti alla prova quello che hai imparato con la sfida finale.</p>
                    <button onclick="startQuiz()" class="bg-white text-[#5A5A40] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#f9f7f2] transition-colors shadow-lg">
                        Inizia il Quiz Finale
                    </button>
                </div>
            </div>
        ` : ''}

        <footer class="text-center text-[#8a867e] py-16 text-xs uppercase tracking-[0.5em] font-bold border-t border-[#e5e2db]">
            AudioEdu Creator • Natural Tones
        </footer>
    </div>

    <script>
        function toggleScript() {
            const container = document.getElementById('script-container');
            container.classList.toggle('hidden');
        }

        function checkShortAnswer(qIdx, correctTxt) {
            const input = document.getElementById('q-' + qIdx + '-input');
            const btn = document.getElementById('q-' + qIdx + '-btn');
            const val = input.value.trim().toLowerCase();
            const correct = correctTxt.trim().toLowerCase();
            
            input.disabled = true;
            btn.disabled = true;
            btn.style.opacity = "0.5";
            
            const feedback = document.getElementById('feedback-' + qIdx);
            feedback.classList.remove('hidden');
            
            if (val === correct) {
                feedback.innerText = "Ottimo lavoro! La risposta è corretta.";
                feedback.className = "mt-6 p-4 rounded-xl text-sm font-bold serif italic bg-green-50 text-green-700 border border-green-100";
                input.className = "flex-1 p-4 rounded-xl border-2 border-green-500 bg-green-50 outline-none";
            } else {
                feedback.innerText = "Quasi. La risposta corretta era: " + correctTxt;
                feedback.className = "mt-6 p-4 rounded-xl text-sm font-bold serif italic bg-orange-50 text-orange-700 border border-orange-100";
                input.className = "flex-1 p-4 rounded-xl border-2 border-orange-500 bg-orange-50 outline-none";
            }
        }

        function checkAnswer(qIdx, optIdx, correctIdx) {
            const feedback = document.getElementById('feedback-' + qIdx);
            const buttons = document.querySelectorAll('[id^="q-' + qIdx + '-opt-"]');
            
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = "0.5";
            });
            
            feedback.classList.remove('hidden');
            const clickedBtn = document.getElementById('q-' + qIdx + '-opt-' + optIdx);
            clickedBtn.style.opacity = "1";

            if (optIdx === correctIdx) {
                feedback.innerText = "Eccellente. La risposta è corretta.";
                feedback.className = "mt-6 p-4 rounded-xl text-sm font-bold serif italic bg-green-50 text-green-700 border border-green-100";
                clickedBtn.className = "text-left p-4 rounded-xl border-2 border-green-500 bg-green-50 font-bold";
            } else {
                feedback.innerText = "Non proprio. La riflessione corretta era la numero " + (correctIdx + 1);
                feedback.className = "mt-6 p-4 rounded-xl text-sm font-bold serif italic bg-orange-50 text-orange-700 border border-orange-100";
                clickedBtn.className = "text-left p-4 rounded-xl border-2 border-orange-500 bg-orange-50 font-bold";
                const correctBtn = document.getElementById('q-' + qIdx + '-opt-' + correctIdx);
                correctBtn.style.opacity = "1";
                correctBtn.className = "text-left p-4 rounded-xl border-2 border-green-500 bg-green-50 font-bold";
            }
        }

        // Quiz Logic
        let currentQuizQuestion = 0;
        let score = 0;
        const quizData = ${JSON.stringify(finalQuiz?.questions || [])};

        function startQuiz() {
            renderQuizQuestion();
        }

        function renderQuizQuestion() {
            const container = document.getElementById('quiz-content');
            if (currentQuizQuestion >= quizData.length) {
                container.innerHTML = \`
                    <div class="text-center space-y-6 py-8">
                        <h3 class="text-4xl serif font-bold italic">Sfida Completata</h3>
                        <div class="w-16 h-1 bg-white/30 mx-auto rounded-full"></div>
                        <p class="text-xl serif italic opacity-90">Il tuo punteggio: <span class="font-bold underline decoration-[#d1a27e] decoration-4 text-white">\${score} / \${quizData.length}</span></p>
                        <button onclick="window.location.reload()" class="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full border border-white/30 transition-all font-bold text-xs uppercase tracking-widest mt-6">Ricomincia</button>
                    </div>
                \`;
                return;
            }

            const q = quizData[currentQuizQuestion];
            let interactiveContent = '';

            if (q.type === 'short_answer') {
                interactiveContent = \`
                    <div class="flex flex-col gap-4">
                        <input 
                            type="text" 
                            id="quiz-input" 
                            class="p-6 rounded-2xl border border-white/20 bg-white/5 text-white outline-none serif text-xl italic" 
                            placeholder="Scrivi la risposta e premi invio..."
                            onkeypress="if(event.key === 'Enter') handleQuizAnswer(this.value)"
                        >
                        <button 
                            onclick="handleQuizAnswer(document.getElementById('quiz-input').value)"
                            class="bg-white text-[#5A5A40] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs"
                        >
                            Invia Risposta
                        </button>
                    </div>
                \`;
            } else {
                interactiveContent = \`
                    <div class="grid gap-4">
                        \${q.options.map((opt, i) => \`
                            <button onclick="handleQuizAnswer(\${i})" class="text-left p-6 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all font-medium text-white shadow-sm serif text-lg italic">
                                \${opt}
                            </button>
                        \`).join('')}
                    </div>
                \`;
            }

            container.innerHTML = \`
                <div class="space-y-8">
                    <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                        <span>Domanda \${currentQuizQuestion + 1} di \${quizData.length}</span>
                        <span>Corrette: \${score}</span>
                    </div>
                    <p class="text-2xl serif font-bold italic leading-tight">\${q.text}</p>
                    \${interactiveContent}
                </div>
            \`;

            if (q.type === 'short_answer') {
                setTimeout(() => {
                    const inp = document.getElementById('quiz-input');
                    if(inp) inp.focus();
                }, 100);
            }
        }

        function handleQuizAnswer(ans) {
            const q = quizData[currentQuizQuestion];
            let isCorrect = false;

            if (q.type === 'short_answer') {
                const val = String(ans).trim().toLowerCase();
                const correct = String(q.correctAnswer).trim().toLowerCase();
                isCorrect = (val === correct);
            } else {
                isCorrect = (ans === q.correctAnswer);
            }

            if (isCorrect) score++;
            currentQuizQuestion++;
            renderQuizQuestion();
        }
    </script>
</body>
</html>
  `;
}
