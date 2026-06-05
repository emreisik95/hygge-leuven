"use client";

import { useId, useMemo, useRef, useState } from "react";

// A tiny, deterministic "find your drink" quiz. Three friendly multiple-choice
// questions map — with no randomness — to one recommended drink from a baked
// list. Everything lives client-side; nothing is stored or sent. Each question
// is a real radio group (native <input type="radio"> inside a <fieldset>/
// <legend>), so it is keyboard- and screen-reader-operable for free.

type Choice = { value: string; label: string };
type Question = { id: string; prompt: string; choices: Choice[] };

type DrinkKey =
  | "flatWhite"
  | "cortado"
  | "filter"
  | "chai"
  | "hotChocolate"
  | "icedLatte";

type Drink = {
  key: DrinkKey;
  name: string;
  blurb: string;
  emoji: string;
};

const QUESTIONS: Question[] = [
  {
    id: "mood",
    prompt: "How are you feeling today?",
    choices: [
      { value: "cozy", label: "Cosy and slow" },
      { value: "energised", label: "Bright and energised" },
    ],
  },
  {
    id: "milk",
    prompt: "Milk, or no milk?",
    choices: [
      { value: "milk", label: "Yes, make it creamy" },
      { value: "black", label: "Keep it black" },
    ],
  },
  {
    id: "sweet",
    prompt: "Sweet tooth right now?",
    choices: [
      { value: "sweet", label: "A little sweetness, please" },
      { value: "plain", label: "No, just the good stuff" },
    ],
  },
];

const DRINKS: Record<DrinkKey, Drink> = {
  flatWhite: {
    key: "flatWhite",
    name: "Flat white",
    blurb:
      "Velvety oat or whole milk over a double ristretto — our quiet house classic for settling into a corner.",
    emoji: "☕",
  },
  cortado: {
    key: "cortado",
    name: "Cortado",
    blurb:
      "Bright espresso cut with just a splash of warm milk. Small, balanced, and wide awake — like you.",
    emoji: "🥛",
  },
  filter: {
    key: "filter",
    name: "Filter brew",
    blurb:
      "A clean single-origin pour-over, black and aromatic. Best with a book and an unhurried afternoon.",
    emoji: "🫖",
  },
  chai: {
    key: "chai",
    name: "Spiced chai latte",
    blurb:
      "House-steeped cardamom, cinnamon and ginger folded into steamed milk. Hygge in a cup.",
    emoji: "🍯",
  },
  hotChocolate: {
    key: "hotChocolate",
    name: "Hot chocolate",
    blurb:
      "Dark Danish-style cocoa, thick and comforting. A little treat for a slow, cosy day.",
    emoji: "🍫",
  },
  icedLatte: {
    key: "icedLatte",
    name: "Iced latte",
    blurb:
      "Cold milk, espresso and ice — smooth and refreshing when you want something lively and light.",
    emoji: "🧊",
  },
};

// Deterministic mapping: every combination of the three answers resolves to
// exactly one drink. No randomness, so the same answers always agree.
function recommend(mood: string, milk: string, sweet: string): DrinkKey {
  if (milk === "black") {
    // No milk: it comes down to filter (cosy/plain) or cortado (energised).
    if (mood === "energised") return "cortado";
    return "filter";
  }
  // Milk wanted.
  if (sweet === "sweet") {
    return mood === "cozy" ? "hotChocolate" : "chai";
  }
  // Milk, not sweet.
  return mood === "energised" ? "icedLatte" : "flatWhite";
}

export function DrinkFinder({
  heading,
  backToTopLabel,
}: {
  heading: string;
  backToTopLabel: string;
}) {
  const baseId = useId();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement | null>(null);

  const complete = QUESTIONS.every((q) => answers[q.id]);

  const result = useMemo<Drink | null>(() => {
    if (!complete) return null;
    const key = recommend(answers.mood, answers.milk, answers.sweet);
    return DRINKS[key];
  }, [complete, answers]);

  function choose(questionId: string, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      const done = QUESTIONS.every((q) => next[q.id]);
      if (done) {
        // Move focus to the result once the last answer lands, so keyboard
        // users are taken straight to the recommendation.
        requestAnimationFrame(() => resultRef.current?.focus());
      }
      return next;
    });
  }

  function reset() {
    setAnswers({});
  }

  return (
    <section
      className="pane pane-drink-finder"
      id="drink-finder"
      aria-labelledby="drink-finder-heading"
    >
      <a href="#landing" className="skip-link">Skip section</a>
      <div className="drink-finder-wrap">
        <h2 className="drink-finder-heading" id="drink-finder-heading">{heading}</h2>
        <p className="drink-finder-intro">
          Three little questions and we&rsquo;ll point you to your cup.
        </p>

        <form
          className="drink-finder-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <ol className="drink-finder-questions" role="list">
            {QUESTIONS.map((q, qi) => {
              const groupName = `${baseId}-${q.id}`;
              return (
                <li key={q.id} className="drink-finder-question">
                  <fieldset className="drink-finder-fieldset">
                    <legend className="drink-finder-legend">
                      <span className="drink-finder-step" aria-hidden="true">
                        {qi + 1}
                      </span>
                      {q.prompt}
                    </legend>
                    <div className="drink-finder-options">
                      {q.choices.map((c) => {
                        const id = `${groupName}-${c.value}`;
                        const checked = answers[q.id] === c.value;
                        return (
                          <label
                            key={c.value}
                            htmlFor={id}
                            className={`drink-finder-option${checked ? " is-checked" : ""}`}
                          >
                            <input
                              type="radio"
                              id={id}
                              name={groupName}
                              value={c.value}
                              checked={checked}
                              onChange={() => choose(q.id, c.value)}
                              className="drink-finder-radio"
                            />
                            <span className="drink-finder-option-label">{c.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </li>
              );
            })}
          </ol>
        </form>

        <div
          className="drink-finder-result"
          aria-live="polite"
          ref={resultRef}
          tabIndex={result ? -1 : undefined}
        >
          {result ? (
            <div className="drink-finder-card">
              <span className="drink-finder-emoji" aria-hidden="true">
                {result.emoji}
              </span>
              <p className="drink-finder-pick">We&rsquo;d pour you a&hellip;</p>
              <p className="drink-finder-name">{result.name}</p>
              <p className="drink-finder-blurb">{result.blurb}</p>
              <button
                type="button"
                className="drink-finder-reset"
                onClick={reset}
              >
                Start over
              </button>
            </div>
          ) : (
            <p className="drink-finder-hint">
              Pick an answer to each question above to see your drink.
            </p>
          )}
        </div>

        <a href="#landing" className="back-link">{backToTopLabel}</a>
      </div>
    </section>
  );
}
