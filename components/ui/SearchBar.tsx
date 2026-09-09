// components/ui/SearchBar.tsx
import React from 'react';
import { Input } from './input';
import { SearchIcon } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, placeholder = 'Search...' }) => (
  <div className="relative flex-grow">
    <Input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 bg-gray-700 text-white"
    />
    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
  </div>
);

export default SearchBar;
