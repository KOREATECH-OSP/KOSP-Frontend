'use client';
import { useState } from 'react';
import Image from 'next/image';
import { suitFont } from "../../style/font";
import KoriCharacter from "../../assets/images/kori/11-10 B 등교 .png";

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색어:', searchQuery);
  };

  return (
    <section className={`bg-trans ${suitFont.className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex flex-col items-start gap-3 w-full">
            <div className="w-16 drop-shadow-sm pointer-events-none select-none">
              <Image src={KoriCharacter} alt="캐릭터" className="w-full h-auto" priority />
            </div>
            <div className="flex w-full items-center bg-white border border-gray-200/70 rounded-full pl-6 pr-2 py-2 focus-within:border-gray-400 focus-within:ring focus-within:ring-gray-200 transition">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-none"
            />
            <button
              type="submit"
              className="ml-3 px-6 py-2.5 rounded-full text-white font-medium shadow-sm transition bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B] hover:opacity-90 cursor-pointer"
            >
              Go →
            </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SearchBar;