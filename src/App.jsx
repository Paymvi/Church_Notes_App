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

    let savedChurches = [];

    if (saved) {
      try {
        savedChurches = JSON.parse(saved);
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

        // Keep previously saved notes if they exist.
        notes: savedChurch?.notes || [],
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
      title: "",
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
            {/* <p className="page-eyebrow">
              MY NOTES
            </p> */}

            {/* <h1>Church Notes</h1> */}

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
                        value={note.date}
                        onChange={(event) =>
                          updateNote(
                            note.id,
                            "date",
                            event.target.value
                          )
                        }
                        placeholder="Date"
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