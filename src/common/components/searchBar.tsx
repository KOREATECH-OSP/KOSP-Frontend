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
            {/* 모바일: 세로 배치, 데스크탑: 인라인 배치 */}
            <div className="flex flex-col w-full gap-3 sm:gap-0 sm:flex-row sm:items-center sm:bg-white sm:border sm:border-gray-200/70 sm:rounded-2xl sm:pl-6 sm:pr-2 sm:py-2 sm:focus-within:border-gray-400 sm:focus-within:ring sm:focus-within:ring-gray-200 sm:transition sm:space-x-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
                className="w-full bg-white border border-gray-200/70 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:border-gray-400 focus:ring focus:ring-gray-200 transition sm:flex-1 sm:border-0 sm:rounded-none sm:px-0 sm:py-0 sm:focus:ring-0"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl text-white font-medium shadow-sm transition bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B] hover:opacity-90 cursor-pointer sm:w-auto sm:px-6 sm:py-2.5"
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