'use client';


import { useState } from 'react';
// import SearchIcon from '../../assets/svg/search.svg';

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
  };

  return (
    <section className="bg-trans py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            {/* <SearchIcon width={26} height={26} /> */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 기술스택을 검색해보세요"
              className="w-full pl-14 pr-32 py-4 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:shadow-md"
            />
            <button
              type="submit"
              className="absolute right-2 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition font-medium shadow-sm"
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