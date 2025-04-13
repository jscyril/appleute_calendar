"use client";

import { useState, useRef, useEffect } from "react";
import { Event } from "@/services/eventService";

interface SearchBarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export default function SearchBar({ events, onEventClick }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleResultClick = (event: Event) => {
    onEventClick(event);
    setSearchTerm("");
    setIsSearching(false);
    setSearchResults([]);
  };

  return (
    <div
      ref={searchContainerRef}
      className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-4"
    >
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsSearching(true)}
          placeholder="Search events..."
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm"
        />
        <span className="absolute right-3 top-2.5 text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
      </div>

      {isSearching && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {searchResults.map((event) => (
            <button
              key={event.id}
              onClick={() => handleResultClick(event)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{event.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleString()} -{" "}
                  {new Date(event.endDate).toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
