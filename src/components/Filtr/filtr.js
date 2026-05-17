"use client";

import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const filterData = {
  city: ["Prague", "Brno", "Ostrava", "Plzen"],
  type: ["Concert", "Festival", "Theater", "Sport"],
  genre: ["Rock", "Pop", "Electronic", "Hip-Hop", "Jazz"],
};

const comboBoxSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "10px",
    backgroundColor: "var(--color-bg)",
    fontSize: "13.5px",
    fontWeight: 500,
    color: "var(--color-text)",
    "& fieldset": {
      borderColor: "var(--color-border)",
    },
    "&:hover fieldset": {
      borderColor: "#B7CBE2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--color-brand)",
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input": {
    padding: "0 12px",
  },
  "& .MuiAutocomplete-endAdornment": {
    right: 8,
  },
};

export default function Filtr() {
  const [selected, setSelected] = useState({
    city: null,
    type: null,
    genre: null,
  });

  const handleClear = () => {
    setSelected({
      city: null,
      type: null,
      genre: null,
    });
  };

  return (
    <section className="border-b border-border bg-surface">
      <form
        action="/listings"
        method="get"
        className="mx-auto flex w-full max-w-340 flex-wrap items-center gap-2 px-4 py-3 sm:px-8"
      >
        <input type="hidden" name="city" value={selected.city ?? ""} />
        <input type="hidden" name="type" value={selected.type ?? ""} />
        <input type="hidden" name="genre" value={selected.genre ?? ""} />

        <div className="w-full sm:w-55">
          <Autocomplete
            options={filterData.city}
            value={selected.city}
            onChange={(_, value) =>
              setSelected((prev) => ({ ...prev, city: value || null }))
            }
            autoHighlight
            clearOnEscape
            size="small"
            sx={comboBoxSx}
            renderInput={(params) => (
              <TextField {...params} placeholder="City" />
            )}
          />
        </div>

        <div className="w-full sm:w-55">
          <Autocomplete
            options={filterData.type}
            value={selected.type}
            onChange={(_, value) =>
              setSelected((prev) => ({ ...prev, type: value || null }))
            }
            autoHighlight
            clearOnEscape
            size="small"
            sx={comboBoxSx}
            renderInput={(params) => (
              <TextField {...params} placeholder="Type" />
            )}
          />
        </div>

        <div className="w-full sm:w-55">
          <Autocomplete
            options={filterData.genre}
            value={selected.genre}
            onChange={(_, value) =>
              setSelected((prev) => ({ ...prev, genre: value || null }))
            }
            autoHighlight
            clearOnEscape
            size="small"
            sx={comboBoxSx}
            renderInput={(params) => (
              <TextField {...params} placeholder="Genre" />
            )}
          />
        </div>

        <button
          type="button"
          className="ml-1 text-[13px] font-medium text-text-2 transition hover:text-brand"
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-[10px] bg-cta px-5 text-[13.5px] font-semibold text-white transition hover:bg-cta-hover"
        >
          Search
        </button>
      </form>
    </section>
  );
}
