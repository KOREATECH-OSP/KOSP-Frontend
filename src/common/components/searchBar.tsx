'use client';
import { useState } from 'react';
import { suitFont } from "../../style/font";

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
  };

  return (
    <section className={`bg-trans ${suitFont.className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch}>
          <div className="flex items-center bg-white border border-gray-200/70 rounded-full pl-6 pr-2 py-2 focus-within:border-gray-400 focus-within:ring focus-within:ring-gray-200 transition">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-none"
            />
            <button
              type="submit"
              className="ml-3 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition font-medium shadow-sm"
            >
              Go →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SearchBar;