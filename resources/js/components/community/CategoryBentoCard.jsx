import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryBentoCard({ category }) {
    return (
        <Link
            to={`/community/browse/${category.id}`}
            className="block h-[296px] w-full max-w-[400px] rounded-[10px] bg-[#212633]"
        >
            <img
                src={category.image}
                alt={category.name}
                className="h-[250px] w-full rounded-t-[8px] object-cover"
            />
            <div className="flex items-center h-[46px]">
                <p className="ml-4 text-[16px] font-medium leading-[1.2] text-white">{category.name}</p>
            </div>
        </Link>
    );
}
