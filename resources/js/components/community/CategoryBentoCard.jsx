import React from 'react';
import { Link } from 'react-router-dom';
import '../../../sass/components/community/CategoryBentoCard.scss';


export default function CategoryBentoCard({ category }) {
    // Handle both API and mock data structures
    const categoryId = category.id || category.slug;
    const imageUrl = category.image || `/storage/communities/category/${category.slug || category.name || 'default'}.jpg`;
    
    return (
        <Link
            to={`/community/browse/${categoryId}`}
            className="category-bento-card__container"
        >
            <img
                src={imageUrl}
                alt={category.name}
                className="category-bento-card__image"
            />
            <div className="category-bento-card__footer">
                <p className="category-bento-card__title">{category.name}</p>
            </div>
        </Link>
    );
}
