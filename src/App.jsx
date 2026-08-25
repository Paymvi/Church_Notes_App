import { useEffect, useMemo, useState } from "react";
import "./App.css";


// =========================================================
// STARTER DATA
//
// Eventually these churches can come from a database.
// For now, we keep everything local.
// =========================================================

const starterChurches = [
  {
    id: 1,
    name: "Tower Hill Church",
    image: "/churches/Tower_Hill.jpg",

        serviceTimes: [
      {
        label: "First Service",
        time: "9:00 AM",
      },
      {
        label: "Second Service",
        time: "10:30 AM",
      },
    ],


    notes: [],
    imagePosition: "5% 35%",
  },

  {
    id: 2,
    name: "Fellowship Bible Church",
    image: "/churches/Fellowship_Bible_Church.jpg",
    notes: [],
  },

  {
    id: 3,
    name: "Other Churches",
    image: "/churches/another-church.jpg",
    notes: [],
  },

  {
    id: 4,
    name: "Bible Studies",
    image: "/churches/another-church.jpg",
    notes: [],
  },
];

// =========================================================
// DATE HELPER
// =========================================================

// =========================================================
// DATE HELPERS
// =========================================================

// Returns today's LOCAL date as:
// 2026-08-25
//
// We intentionally do NOT use:
// new Date().toISOString().split("T")[0]
//
// because UTC can sometimes shift the date by one day.
function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// Turns:
// 2026-08-25
//
// into:
// August 25, 2026
//
// This is only for DISPLAYING the date.
function formatNoteDate(dateString) {
  if (!dateString) return "";

  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return dateString;
  }

  const [, year, month, day] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


// Converts OLD saved dates like:
//
// August 25, 2026
//
// into:
//
// 2026-08-25
//
// This lets your existing notes keep working.
function normalizeNoteDate(dateString) {
  if (!dateString) {
    return getTodayDate();
  }

  // Already in the format we want.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  const parsed = new Date(dateString);

  if (Number.isNaN(parsed.getTime())) {
    return getTodayDate();
  }

  const year = parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================================================
// SEARCH RESULT PREVIEW
//
// Finds the searched word inside a note and returns a small
// piece of text around it.
// =========================================================

function getSearchSnippet(text, query) {
  if (!text) return "";

  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) {
    return text.slice(0, 120);
  }

  const lowerText = text.toLowerCase();

  const matchIndex = lowerText.indexOf(cleanQuery);

  // If the actual note body did not contain the search,
  // just show the beginning of the note.
  if (matchIndex === -1) {
    return text.length > 120
      ? `${text.slice(0, 120)}...`
      : text;
  }

  // Show some text before and after the matching word.
  const start = Math.max(0, matchIndex - 45);
  const end = Math.min(
    text.length,
    matchIndex + cleanQuery.length + 75
  );

  const snippet = text.slice(start, end).trim();

  return `${start > 0 ? "..." : ""}${snippet}${
    end < text.length ? "..." : ""
  }`;
}


export default function App() {

  // =========================================================
  // CHURCH DATA
  //
  // First try loading the user's saved churches/notes.
  // If nothing exists yet, use starterChurches.
  // =========================================================

  const [churches, setChurches] = useState(() => {
    const saved = localStorage.getItem("bibleNotesChurches");

    let savedChurches = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        savedChurches = Array.isArray(parsed)
          ? parsed
          : [];
      } catch {
        savedChurches = [];
      }
    }

    // Always use the CURRENT church information from the code.
    // Only bring over the saved notes from localStorage.
    return starterChurches.map((church) => {
      const savedChurch = savedChurches.find(
        (savedChurch) => savedChurch.id === church.id
      );

      return {
        ...church,

        notes: (savedChurch?.notes || []).map((note) => ({
          ...note,

          // Convert old human-readable dates
          // to YYYY-MM-DD automatically.
          date: normalizeNoteDate(note.date),
        })),
      };
    });
  });


  // =========================================================
  // CURRENT CHURCH
  //
  // null = show home page
  // number = show that church's notes
  // =========================================================

  const [selectedChurchId, setSelectedChurchId] = useState(null);

  // GLOBAL SEARCH
  const [searchQuery, setSearchQuery] = useState("");

  // LIGHT / DARK MODE
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("bibleNotesTheme");

    // Use the user's saved choice first
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Otherwise use the phone/computer's current preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  });


  // NOTE ACTION MENU
  const [openNoteMenuId, setOpenNoteMenuId] = useState(null);


  useEffect(() => {
    localStorage.setItem("bibleNotesTheme", theme);

    // Also lets the browser know which theme we're using
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);


  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }


  // =========================================================
  // SAVE EVERYTHING
  //
  // Whenever churches/notes change, save them locally.
  // =========================================================

  useEffect(() => {
    const notesToSave = churches.map((church) => ({
      id: church.id,
      notes: church.notes,
    }));

    localStorage.setItem(
      "bibleNotesChurches",
      JSON.stringify(notesToSave)
    );
  }, [churches]);


  // Find the church currently being viewed.
  const selectedChurch = useMemo(() => {
    return churches.find(
      (church) => church.id === selectedChurchId
    );
  }, [churches, selectedChurchId]);


  // =========================================================
  // DISPLAYED NOTES
  //
  // Pinned notes appear first.
  // We make a COPY before sorting so we do not directly
  // mutate React state.
  // =========================================================

  // =========================================================
  // SORT NOTES
  //
  // 1. Pinned notes appear first
  // 2. Within each group, newest dates appear first
  // =========================================================

  const displayedNotes = useMemo(() => {
    if (!selectedChurch) {
      return [];
    }

    return [...selectedChurch.notes].sort((a, b) => {

      // -----------------------------------------
      // FIRST: PINNED NOTES
      // -----------------------------------------

      const pinDifference =
        Number(Boolean(b.isPinned)) -
        Number(Boolean(a.isPinned));

      if (pinDifference !== 0) {
        return pinDifference;
      }


      // -----------------------------------------
      // SECOND: NEWEST DATE FIRST
      //
      // YYYY-MM-DD can safely be compared because
      // the year comes first, then month, then day.
      // -----------------------------------------

      const dateA = a.date || "";
      const dateB = b.date || "";

      return dateB.localeCompare(dateA);
    });

  }, [selectedChurch]);


  // =========================================================
  // GLOBAL SEARCH RESULTS
  //
  // Searches:
  // - note title
  // - note body
  // - note date
  // - church name
  //
  // Results from ALL churches are combined together.
  // =========================================================

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Don't show every note when the search box is empty.
    if (!query) {
      return [];
    }

    return churches.flatMap((church) => {
      return church.notes
        .filter((note) => {
          const searchableText = [
            church.name,
            note.title,

            // Search both formats:
            // "2026-08-25"
            // AND
            // "August 25, 2026"
            note.date,
            formatNoteDate(note.date),

            note.text,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(query);
        })
        .map((note) => ({
          churchId: church.id,
          churchName: church.name,
          churchImage: church.image,
          note,
        }));
    });
  }, [churches, searchQuery]);


  // =========================================================
  // OPEN SEARCH RESULT
  //
  // Opens the correct church and automatically expands
  // the note that was selected.
  // =========================================================

  function openSearchResult(churchId, noteId) {

    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        if (church.id !== churchId) {
          return church;
        }

        return {
          ...church,

          notes: church.notes.map((note) => ({
            ...note,

            // Open only the note we selected.
            isOpen: note.id === noteId,
          })),
        };
      })
    );

    // Open that church.
    setSelectedChurchId(churchId);

    // Clear the search for next time.
    setSearchQuery("");
  }


  // =========================================================
  // OPEN / CLOSE NOTE
  // =========================================================

  function toggleNote(noteId) {

    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        if (church.id !== selectedChurchId) {
          return church;
        }

        return {
          ...church,

          notes: church.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  isOpen: !note.isOpen,
                }
              : note
          ),
        };
      })
    );
  }


  // =========================================================
  // CHANGE NOTE CONTENT
  // =========================================================

  function updateNote(noteId, field, value) {

    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        if (church.id !== selectedChurchId) {
          return church;
        }

        return {
          ...church,

          notes: church.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  [field]: value,
                }
              : note
          ),
        };
      })
    );
  }


  // =========================================================
  // PIN / UNPIN NOTE
  // =========================================================

  function togglePinNote(noteId) {
    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        // Only modify the church we're currently viewing.
        if (church.id !== selectedChurchId) {
          return church;
        }

        return {
          ...church,

          notes: church.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  isPinned: !note.isPinned,
                }
              : note
          ),
        };
      })
    );

    // Close the "..." menu after selecting the action.
    setOpenNoteMenuId(null);
  }


  // =========================================================
  // DELETE NOTE
  // =========================================================

  function deleteNote(noteId) {

    const shouldDelete = window.confirm(
      "Delete this note? This cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        if (church.id !== selectedChurchId) {
          return church;
        }

        return {
          ...church,

          // Keep every note except the one being deleted.
          notes: church.notes.filter(
            (note) => note.id !== noteId
          ),
        };
      })
    );

    // Close menu.
    setOpenNoteMenuId(null);
  }


  // =========================================================
  // CHANGE TEXT SIZE
  // =========================================================

  function changeFontSize(noteId, amount) {

    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        if (church.id !== selectedChurchId) {
          return church;
        }

        return {
          ...church,

          notes: church.notes.map((note) => {

            if (note.id !== noteId) {
              return note;
            }

            const newSize = Math.min(
              28,
              Math.max(12, note.fontSize + amount)
            );

            return {
              ...note,
              fontSize: newSize,
            };
          }),
        };
      })
    );
  }


  // =========================================================
  // ADD NEW NOTE
  // =========================================================

  function addNote() {

    const newNote = {
      id: Date.now(),
      title: "",
      date: getTodayDate(),
      text: "",
      isOpen: true,
      fontSize: 16,

      // New notes start unpinned.
      isPinned: false,
    };

    setChurches((currentChurches) =>
      currentChurches.map((church) => {

        if (church.id !== selectedChurchId) {
          return church;
        }

        return {
          ...church,
          notes: [
            newNote,
            ...church.notes,
          ],
        };
      })
    );
  }


  // =========================================================
  // HOME PAGE
  // =========================================================

  if (!selectedChurch) {
    return (
      <div className="app-shell">

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            theme === "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
        >
          {theme === "light" ? "☾" : "☀"}
        </button>

        <main className="home-page">

          <header className="page-header">
            {/* <p className="page-eyebrow">
              MY NOTES
            </p> */}

            {/* <h1>Church Notes</h1> */}

          </header>

          {/* =========================================================
              GLOBAL SEARCH
          ========================================================= */}

          <section className="global-search">

            <div className="global-search-input-wrap">

              {/* SEARCH ICON */}

              <svg
                className="global-search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M16.5 16.5L21 21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>


              {/* SEARCH INPUT */}

              <input
                className="global-search-input"
                type="search"
                placeholder="Search all notes..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />


              {/* CLEAR BUTTON */}

              {searchQuery && (
                <button
                  type="button"
                  className="global-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

          </section>

          {/* =========================================================
              SEARCH RESULTS
          ========================================================= */}

          {searchQuery.trim() && (

            <section className="global-search-results">

              <div className="global-search-results-header">

                <span>
                  {searchResults.length}{" "}
                  {searchResults.length === 1
                    ? "result"
                    : "results"}
                </span>

              </div>


              {/* NO RESULTS */}

              {searchResults.length === 0 && (

                <div className="global-search-empty">

                  <h2>No notes found</h2>

                  <p>
                    Try another word or phrase.
                  </p>

                </div>

              )}


              {/* RESULTS */}

              {searchResults.map((result) => (

                <button
                  key={`${result.churchId}-${result.note.id}`}
                  className="global-search-result"
                  onClick={() =>
                    openSearchResult(
                      result.churchId,
                      result.note.id
                    )
                  }
                >

                  <div className="search-result-top">

                    <div className="search-result-text">

                      <h2>
                        {result.note.title || "New Note"}
                      </h2>

                      <p className="search-result-meta">
                        {result.churchName}

                        {result.note.date
                          ? ` · ${formatNoteDate(result.note.date)}`
                          : ""}
                      </p>

                    </div>


                    <span className="search-result-arrow">
                      ›
                    </span>

                  </div>


                  {result.note.text && (

                    <p className="search-result-preview">
                      {getSearchSnippet(
                        result.note.text,
                        searchQuery
                      )}
                    </p>

                  )}

                </button>

              ))}

            </section>

          )}

          {!searchQuery.trim() && (
            <section className="church-list">

              {churches.map((church) => (

                <button
                  key={church.id}
                  className="church-card"
                  onClick={() =>
                    setSelectedChurchId(church.id)
                  }
                >

                  <div className="church-image-wrapper">

                    <img
                      src={church.image}
                      alt={church.name}
                      className="church-image"
                      style={{
                        objectPosition: church.imagePosition || "50% 50%",
                      }}
                    />

                  </div>


                  <div className="church-card-footer">

                    <div>
                      <h2>{church.name}</h2>

                      {/* <p>
                        {church.notes.length}{" "}
                        {church.notes.length === 1
                          ? "note"
                          : "notes"}
                      </p> */}
                    </div>


                    <span className="church-arrow">
                      ›
                    </span>

                  </div>

                </button>

              ))}

            </section>
          )}

        </main>

      </div>
    );
  }


  // =========================================================
  // CHURCH NOTES PAGE
  // =========================================================

  return (
    <div className="app-shell">

    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
    >
      {theme === "light" ? "☾" : "☀"}
    </button>

    <main className="notes-page">

        <button
          className="back-button"
          onClick={() => setSelectedChurchId(null)}
        >
          ← Churches
        </button>


        {/* =========================================================
            CHURCH HERO
        ========================================================= */}

        <section className="church-detail-header">

          {/* LARGE BANNER IMAGE */}

          <div className="church-banner">
            <img
              src={selectedChurch.image}
              alt={selectedChurch.name}
              style={{
                objectPosition:
                  selectedChurch.bannerPosition ||
                  selectedChurch.imagePosition ||
                  "50% 50%",
              }}
            />
          </div>


          {/* CHURCH NAME */}

          <div className="church-detail-title">
            <p className="page-eyebrow">
              CHURCH
            </p>

            <h1>
              {selectedChurch.name}
            </h1>
          </div>


          {/* SERVICE TIMES */}

          {selectedChurch.serviceTimes?.length > 0 && (

            <div className="service-times">

              {selectedChurch.serviceTimes.map((service, index) => (

                <div
                  className="service-time"
                  key={index}
                >
                  <span className="service-time-label">
                    {service.label}
                  </span>

                  <strong className="service-time-value">
                    {service.time}
                  </strong>
                </div>

              ))}

            </div>

          )}

        </section>


        <div className="notes-top-row">

          <div className="notes-section-heading">

            <h2>Notes</h2>
          </div>


          <button
            className="add-note-button"
            onClick={addNote}
          >
            + New Note
          </button>

        </div>


        <section className="notes-stack">

          {selectedChurch.notes.length === 0 && (

            <div className="empty-notes">
              <h2>No notes yet</h2>

              <p>
                Add your first sermon or Bible study note.
              </p>

              <button onClick={addNote}>
                + Create Note
              </button>
            </div>

          )}


          {displayedNotes.map((note) => (

            <article
              key={note.id}
              className={
                note.isOpen
                  ? "note-card note-card-open"
                  : "note-card"
              }
            >

              {/* COLLAPSED NOTE HEADER */}

              {/* =========================================================
                  NOTE HEADER
              ========================================================= */}

              <div className="note-card-header">

                {/* Clicking title/date opens or closes the note */}

                <button
                  type="button"
                  className="note-header-main"
                  onClick={() => toggleNote(note.id)}
                >

                  <div className="note-header-text">

                    <div className="note-title-row">

                      <h2>
                        {note.title || "New Note"}
                      </h2>

                      {note.isPinned && (
                        <span className="note-pinned-badge">
                          PINNED
                        </span>
                      )}

                    </div>

                    <p>{formatNoteDate(note.date)}</p>

                  </div>

                </button>


                {/* THREE DOT MENU */}

                <div className="note-menu-container">

                  <button
                    type="button"
                    className="note-menu-button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setOpenNoteMenuId((currentId) =>
                        currentId === note.id
                          ? null
                          : note.id
                      );
                    }}
                    aria-label="Note options"
                  >
                    ⋯
                  </button>


                  {openNoteMenuId === note.id && (

                    <div
                      className="note-menu-dropdown"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <button
                        type="button"
                        className="note-menu-item"
                        onClick={() =>
                          togglePinNote(note.id)
                        }
                      >
                        {note.isPinned ? "Unpin" : "Pin"}
                      </button>


                      <button
                        type="button"
                        className="note-menu-item note-menu-delete"
                        onClick={() =>
                          deleteNote(note.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  )}

                </div>

              </div>


              {/* EXPANDED NOTE */}

              {note.isOpen && (

                <div className="note-card-body">

                  


                  <div className="note-editor-fields">

                    {/* NOTE TITLE */}

                    <input
                      className="note-title-input"
                      value={note.title}
                      onChange={(event) =>
                        updateNote(
                          note.id,
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="Note title"
                    />


                    {/* DATE + TEXT SIZE */}

                    <div className="date-font-row">

                      <input
                        className="note-date-input"
                        type="date"
                        value={note.date}
                        onChange={(event) =>
                          updateNote(
                            note.id,
                            "date",
                            event.target.value
                          )
                        }
                      />


                      <div className="inline-font-controls">

                        <button
                          type="button"
                          onClick={() =>
                            changeFontSize(note.id, -1)
                          }
                          aria-label="Decrease text size"
                        >
                          A−
                        </button>


                        <span>
                          {note.fontSize}
                        </span>


                        <button
                          type="button"
                          onClick={() =>
                            changeFontSize(note.id, 1)
                          }
                          aria-label="Increase text size"
                        >
                          A+
                        </button>

                      </div>

                    </div>


                    {/* NOTE CONTENT */}

                    <textarea
                      className="note-textarea"
                      placeholder="Write your sermon notes..."
                      value={note.text}
                      onChange={(event) =>
                        updateNote(
                          note.id,
                          "text",
                          event.target.value
                        )
                      }
                      style={{
                        fontSize: `${note.fontSize}px`,
                      }}
                    />

                  </div>

                </div>

              )}

            </article>

          ))}

        </section>

      </main>

    </div>
  );
}