"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Advocate } from "./types/advocates";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Advocate; direction: "asc" | "desc" } | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch advocates with delayed loader for smooth UX
  const fetchAdvocates = async (
    keyword: string = "",
    sortBy: keyof Advocate | null = null,
    sortDir: "asc" | "desc" | null = null
  ) => {
    setError(null);

    // Only show loader if request takes longer than 200ms
    const loaderTimeout = setTimeout(() => setLoading(true), 200);

    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortDir) params.append("sortDir", sortDir);

      const res = await fetch(`/api/advocates?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setAdvocates(json.data.data);
    } catch (err: any) {
      console.error("Error fetching advocates:", err);
      setError("Failed to fetch advocates. Please try again.");
      setAdvocates([]);
    } finally {
      clearTimeout(loaderTimeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvocates();
  }, []);

  // Debounced search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAdvocates(term, sortConfig?.key ?? null, sortConfig?.direction ?? null);
    }, 300);
  };

  // Sorting click
  const handleSort = (key: keyof Advocate) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    fetchAdvocates(searchTerm, key, direction);
  };

  const SortIcon = ({ column }: { column: keyof Advocate }) => {
    if (!sortConfig || sortConfig.key !== column) {
      return <ArrowUpDown className="inline w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-indigo-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-indigo-600" />
    );
  };

  const columns: { key: keyof Advocate; label: string }[] = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "city", label: "City" },
    { key: "degree", label: "Degree" },
    { key: "specialties", label: "Specialties" },
    { key: "yearsOfExperience", label: "Experience" },
    { key: "phoneNumber", label: "Phone" },
  ];

  return (
    <main className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">Solace Advocates</h1>

      {/* Search Section */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by name, city, degree, specialty..."
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Searching for: <span className="font-semibold">{searchTerm}</span>
          </p>
        )}
      </div>

      {/* Loading & Error Indicators */}
      {loading && (
        <p className="mt-2 text-sm text-indigo-600 flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Loading results...
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="mt-8 overflow-x-auto rounded-xl shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-indigo-50 sticky top-0 z-10">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none ${
                    sortConfig?.key === key ? "bg-indigo-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{label}</span>
                    <SortIcon column={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {!loading && advocates.length === 0 && !error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                  No advocates found.
                </td>
              </tr>
            ) : (
              advocates.map((advocate, index) => (
                <tr key={index} className="hover:bg-indigo-50/50">
                  <td className="px-4 py-3">{advocate.firstName}</td>
                  <td className="px-4 py-3">{advocate.lastName}</td>
                  <td className="px-4 py-3">{advocate.city}</td>
                  <td className="px-4 py-3">{advocate.degree}</td>
                  <td className="px-4 py-3">
                    <ul className="flex flex-wrap gap-1">
                      {advocate.specialties.map((s, idx) => (
                        <li key={idx} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">{advocate.yearsOfExperience}</td>
                  <td className="px-4 py-3">{advocate.phoneNumber}</td>
                </tr>
              ))
            )}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 bg-gray-200 rounded">&nbsp;</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}