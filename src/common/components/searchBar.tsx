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
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
              className="w-full pl-6 pr-32 py-4 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:shadow-md"
            />
            <button
              type="submit"
              className="absolute right-2 bg-blue-600 text-white px-6 py-2.5 rounded-[8px] hover:bg-blue-700 transition font-medium shadow-sm"
            >
              검색
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SearchBar;