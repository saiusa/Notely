import React from 'react';
import { Link } from 'react-router-dom';
import '../../../sass/components/community/CategoryBentoCard.scss';


export default function CategoryBentoCard({ category }) {
    return (
        <Link
            to={`/community/browse/${category.id}`}
            className="category-bento-card__container"
        >
            <img
                src={category.image}
                alt={category.name}
                className="category-bento-card__image"
            />
            <div className="category-bento-card__footer">
                <p className="category-bento-card__title">{category.name}</p>
            </div>
        </Link>
    );
}
