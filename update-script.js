const fs = require('fs');
let file = fs.readFileSync('src/components/templates/DraftTemplate.tsx', 'utf8');

// 1. Welcome cover dress code
file = file.replace(
`            <p className="font-sans text-sm font-medium text-[#7D786F] tracking-wide">
              {fechaStr}{lugarNombre ? \` · \${lugarNombre}\` : ""}{ciudad ? \` — \${ciudad}\` : ""}
            </p>
          </div>
          <button `,
`            <p className="font-sans text-sm font-medium text-[#7D786F] tracking-wide">
              {fechaStr}{lugarNombre ? \` · \${lugarNombre}\` : ""}{ciudad ? \` — \${ciudad}\` : ""}
            </p>
          </div>
          {invitation.portadaDressCode && (
            <p className="font-sans text-sm font-medium text-[#7D786F] tracking-wide mt-2">
              {invitation.portadaDressCode}
            </p>
          )}
          <button `
);

// 2. Hide dress code from main hero
file = file.replace(
`          {invitation.portadaDressCode && (
            <p className="mt-3 text-sm uppercase tracking-[0.2em] opacity-80">
              {invitation.portadaDressCode}
            </p>
          )}`,
``
);

// 3. Trivia storage and logic
file = file.replace(
`        if (data && data.hasAnswered && data.guestScore) {
          setPicks(data.guestScore.answers || {});
          setFinished(true);
        }
      })
      .catch(e => console.error("Error fetching quiz data", e))
      .finally(() => setHasLoaded(true));
  }, [invitationId, guestToken]);`,
`        if (data && data.hasAnswered && data.guestScore) {
          setPicks(data.guestScore.answers || {});
          setFinished(true);
        } else {
          const storageKey = guestToken ? \`quiz_finished_\${invitationId}_\${guestToken}\` : \`quiz_finished_\${invitationId}\`;
          const localPicks = localStorage.getItem(storageKey);
          if (localPicks) {
            setPicks(JSON.parse(localPicks));
            setFinished(true);
          }
        }
      })
      .catch(e => console.error("Error fetching quiz data", e))
      .finally(() => setHasLoaded(true));
  }, [invitationId, guestToken]);`
);

file = file.replace(
`            // fetch stats
            const params = new URLSearchParams({ invitationId });
            if (guestToken) params.append("guestToken", guestToken);
            const statsRes = await fetch(\`/api/quiz?\${params.toString()}\`);
            if (statsRes.ok) {
              const data = await statsRes.json();
              setStats({ avg: data.averagePercentage, count: data.totalResponses });
            }
          } catch (e) {`,
`            // fetch stats
            const params = new URLSearchParams({ invitationId });
            if (guestToken) params.append("guestToken", guestToken);
            const statsRes = await fetch(\`/api/quiz?\${params.toString()}\`);
            if (statsRes.ok) {
              const data = await statsRes.json();
              setStats({ avg: data.averagePercentage, count: data.totalResponses });
            }
            
            const storageKey = guestToken ? \`quiz_finished_\${invitationId}_\${guestToken}\` : \`quiz_finished_\${invitationId}\`;
            localStorage.setItem(storageKey, JSON.stringify(newPicks));
          } catch (e) {`
);

// 4. Trivia UI
file = file.replace(
`      <div className="quiz-box text-center">
        <div className="flex justify-center mb-4 text-amber-500">
          {percent === 100 ? <Trophy className="w-16 h-16" strokeWidth={1.5} /> : percent >= 70 ? <Star className="w-16 h-16" strokeWidth={1.5} /> : <ThumbsUp className="w-16 h-16" strokeWidth={1.5} />}
        </div>
        <h3 style={{ fontFamily: "var(--t-font-d)", fontSize: "28px", color: "var(--t-onpaper)" }}>¡Quiz Completado!</h3>
        <p style={{ marginTop: "12px", opacity: 0.9 }}>
          Respondiste {score} de {preguntas.length} correctamente ({percent}%).
        </p>`,
`      <div className="quiz-box text-center flex flex-col items-center">
        <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "2rem", fontStyle: "italic", color: "var(--t-onpaper)" }}>
          ¡Juego Completado!
        </h3>
        <p style={{ marginTop: "12px", opacity: 0.8, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>
          RESPONDISTE {score} DE {preguntas.length} CORRECTAMENTE ({percent}%)
        </p>`
);

file = file.replace(
`  const q = preguntas[currentIdx];
  if (!q) return null;

  return (
    <div className="quiz-box">
      <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "12px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pregunta {currentIdx + 1} de {preguntas.length}</p>
      <div className="quiz-q" key={currentIdx}>
        <p className="quiz-q-text">{q.pregunta}</p>
        <div className="quiz-opts">`,
`  const q = preguntas[currentIdx];
  if (!q) return null;

  const formatQuestion = (text) => {
    let formatted = text.trim();
    if (formatted.startsWith('¿')) {
      formatted = formatted.substring(1).trim();
    }
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return \`¿\${formatted}\${formatted.endsWith('?') ? '' : '?'}\`;
  };

  return (
    <div className="quiz-box flex flex-col items-center text-center">
      <div className="quiz-q w-full max-w-lg" key={currentIdx}>
        <p className="text-[#2C2C2C] text-2xl md:text-3xl leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', margin: 0, fontWeight: 500, marginBottom: "3.5rem" }}>
          {formatQuestion(q.pregunta)}
        </p>
        <div className="quiz-opts flex flex-wrap justify-center gap-3">`
);

file = file.replace(
`              <button
                key={oi}
                type="button"
                className={className}
                disabled={picks[currentIdx] !== undefined}`,
`              <button
                key={oi}
                type="button"
                style={{ 
                  borderColor: 'var(--t-acc)', 
                  color: chosen ? 'var(--t-onacc)' : 'var(--t-acc)', 
                  backgroundColor: chosen ? 'var(--t-acc)' : 'transparent' 
                }}
                className={\`px-5 py-2.5 rounded-full border text-sm transition-all hover:bg-[var(--t-acc)] hover:text-[var(--t-onacc)] \${className}\`}
                disabled={picks[currentIdx] !== undefined}`
);

file = file.replace(
`            <p className="t-kicker mb-2">
              ¿CUÁNTO SABÉS?
            </p>
            <h2 className="text-[2.5rem] font-bold text-[#1A2B33] mb-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{String(invitation.triviaTitulo ?? "Un juego para vos")}</h2>`,
`            <p className="t-kicker mb-8">
              {String(invitation.triviaTitulo || "¿CUÁNTO SABÉS?")}
            </p>`
);

// 5. Remove RSVP button CSS overrides
const rsvpOverridesRegex = /\/\* Change text of buttons using CSS \*\/[\s\S]*?font-weight: 600 !important;\s*}/g;
file = file.replace(rsvpOverridesRegex, '');

fs.writeFileSync('src/components/templates/DraftTemplate.tsx', file, 'utf8');
console.log('DraftTemplate.tsx updated successfully.');
