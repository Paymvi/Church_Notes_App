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
    name: "Antioch Church",
    image: "/churches/antioch.jpg",

    notes: [
      {
        id: 1,
        title: "Sunday Service",
        date: "August 23, 2026",
        text: `Main passage: John 15

Jesus describes Himself as the true vine.

Things I want to remember:
- Abiding is not passive
- Fruit comes from remaining connected to Christ
- Spiritual growth is not something I manufacture by myself`,
        isOpen: false,
        fontSize: 16,
      },

      {
        id: 2,
        title: "Faith and Obedience",
        date: "August 16, 2026",
        text: "",
        isOpen: false,
        fontSize: 16,
      },
    ],
  },

  {
    id: 2,
    name: "InterVarsity",
    image: "/churches/intervarsity.jpg",

    notes: [
      {
        id: 1,
        title: "Bible Study",
        date: "August 20, 2026",
        text: "",
        isOpen: false,
        fontSize: 16,
      },
    ],
  },

  {
    id: 3,
    name: "Other Church",
    image: "/churches/home-church.jpg",

    notes: [],
  },
];


// =========================================================
// DATE HELPER
// =========================================================

function getTodayDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return starterChurches;
      }
    }

    return starterChurches;
  });


  // =========================================================
  // CURRENT CHURCH
  //
  // null = show home page
  // number = show that church's notes
  // =========================================================

  const [selectedChurchId, setSelectedChurchId] = useState(null);


  // =========================================================
  // SAVE EVERYTHING
  //
  // Whenever churches/notes change, save them locally.
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      "bibleNotesChurches",
      JSON.stringify(churches)
    );
  }, [churches]);


  // Find the church currently being viewed.
  const selectedChurch = useMemo(() => {
    return churches.find(
      (church) => church.id === selectedChurchId
    );
  }, [churches, selectedChurchId]);


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
      title: "New Note",
      date: getTodayDate(),
      text: "",
      isOpen: true,
      fontSize: 16,
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

        <main className="home-page">

          <header className="page-header">
            <p className="page-eyebrow">
              MY NOTES
            </p>

            <h1>Bible Notes</h1>

            <p className="page-subtitle">
              Choose a church or ministry.
            </p>
          </header>


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
                  />

                </div>


                <div className="church-card-footer">

                  <div>
                    <h2>{church.name}</h2>

                    <p>
                      {church.notes.length}{" "}
                      {church.notes.length === 1
                        ? "note"
                        : "notes"}
                    </p>
                  </div>


                  <span className="church-arrow">
                    ›
                  </span>

                </div>

              </button>

            ))}

          </section>

        </main>

      </div>
    );
  }


  // =========================================================
  // CHURCH NOTES PAGE
  // =========================================================

  return (
    <div className="app-shell">

      <main className="notes-page">

        <button
          className="back-button"
          onClick={() => setSelectedChurchId(null)}
        >
          ← Churches
        </button>


        <header className="church-notes-header">

          <div className="small-church-image">

            <img
              src={selectedChurch.image}
              alt={selectedChurch.name}
            />

          </div>


          <div>
            <p className="page-eyebrow">
              NOTES
            </p>

            <h1>
              {selectedChurch.name}
            </h1>
          </div>

        </header>


        <div className="notes-top-row">

          <p>
            {selectedChurch.notes.length}{" "}
            {selectedChurch.notes.length === 1
              ? "note"
              : "notes"}
          </p>


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


          {selectedChurch.notes.map((note) => (

            <article
              key={note.id}
              className={
                note.isOpen
                  ? "note-card note-card-open"
                  : "note-card"
              }
            >

              {/* COLLAPSED NOTE HEADER */}

              <button
                className="note-card-header"
                onClick={() => toggleNote(note.id)}
              >

                <div className="note-header-text">

                  <h2>
                    {note.title || "Untitled Note"}
                  </h2>

                  <p>{note.date}</p>

                </div>


                <span
                  className={
                    note.isOpen
                      ? "note-chevron note-chevron-open"
                      : "note-chevron"
                  }
                >
                 ⌄
                </span>

              </button>


              {/* EXPANDED NOTE */}

              {note.isOpen && (

                <div className="note-card-body">

                  <div className="note-toolbar">

                    <span className="toolbar-label">
                      Text size
                    </span>


                    <div className="font-controls">

                      <button
                        onClick={() =>
                          changeFontSize(note.id, -1)
                        }
                      >
                        A−
                      </button>


                      <span>
                        {note.fontSize}px
                      </span>


                      <button
                        onClick={() =>
                          changeFontSize(note.id, 1)
                        }
                      >
                        A+
                      </button>

                    </div>

                  </div>


                  <label className="field-label">
                    Title
                  </label>

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
                    placeholder="Sermon title"
                  />


                  <label className="field-label">
                    Date
                  </label>

                  <input
                    className="note-date-input"
                    value={note.date}
                    onChange={(event) =>
                      updateNote(
                        note.id,
                        "date",
                        event.target.value
                      )
                    }
                  />


                  <label className="field-label">
                    Notes
                  </label>

                  <textarea
                    className="note-textarea"
                    placeholder="Start writing..."
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

              )}

            </article>

          ))}

        </section>

      </main>

    </div>
  );
}