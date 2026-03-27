import React from 'react';

export const defaultProfile = {
    firstName: 'Jungkook',
    lastName: 'Jeon',
    username: '@jungkook.bts',
    birthday: '1997-09-01',
    country: 'south-korea',
    gender: 'Male',
    description: 'Anyeong hasaeyeo jeoneun bangtan sonyeondan hwangeum maknae jeon jungkook imnida.',
    coverPhoto:
        'https://images.unsplash.com/photo-1473643068424-cd2485f9a97f?auto=format&fit=crop&w=1400&q=80',
    profilePhoto:
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=130&q=80',
};

export const countryOptions = [
    { value: 'south-korea', label: 'Seoul, South Korea' },
    { value: 'japan', label: 'Tokyo, Japan' },
    { value: 'united-states', label: 'Los Angeles, United States' },
    { value: 'canada', label: 'Toronto, Canada' },
];

export function formatBirthday(dateString) {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function getCountryLabel(countryValue) {
    const country = countryOptions.find((item) => item.value === countryValue);
    return country?.label || countryOptions[0].label;
}

function trimPostText(text, limit) {
    if (!text) {
        return '';
    }

    if (text.length <= limit) {
        return text;
    }

    return `${text.slice(0, limit)}...`;
}

export function getPublicJournalPosts(journalCards) {
    return journalCards
        .filter((card) => card.isPublic)
        .map((card, index) => ({
            ...card,
            id: card.id || `public-journal-${index}`,
            createdAt:
                card.createdAt ||
                `${new Date().getFullYear()}-01-01T00:${String(index).padStart(2, '0')}:00Z`,
            user: 'jin.bts',
            avatar: defaultProfile.profilePhoto,
            username: 'jin.bts',
            handle: '@jin.bts',
            time: card.time || '1 hour',
        }));
}

export function ProfilePostFeedCard({ post }) {
    const body = trimPostText(post.text, post.image ? 120 : 180);

    return (
        <article className="rounded-[10px] bg-[#212633] p-5 text-white">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <img src={post.avatar} alt={post.username} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                        <p className="text-[24px] font-semibold leading-[1.15]">{post.username}</p>
                        <p className="mt-1 text-[14px] font-normal leading-none text-[#9ca0ad]">{post.time}</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#9ca0ad] transition-colors hover:bg-[#2a3043] hover:text-white"
                    aria-label="Post options"
                >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
            </div>

            {body ? <p className="mt-4 text-[16px] font-normal leading-[1.6] text-[#e8ebf5]">{body}</p> : null}

            {post.image ? (
                <img src={post.image} alt="journal" className="mt-4 max-h-[420px] w-full rounded-[6px] object-cover" />
            ) : null}

            <div className="mt-4 flex items-center gap-2 text-[13px] text-[#b9bdc8]">
                {post.mood ? (
                    <span className="rounded-full bg-[#f2f4ef] px-3 py-1 text-[14px] font-medium text-[#4a4459]">{post.mood}</span>
                ) : null}
            </div>

            <div className="mt-4 border-t border-[#303548] pt-3">
                <div className="grid grid-cols-3 text-center text-[13px] text-[#e8e8e8]">
                    <button type="button" className="flex items-center justify-center gap-1.5 transition-colors hover:text-[#9b84d8]">
                        <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                        {post.likes || '77k'}
                    </button>
                    <button type="button" className="flex items-center justify-center gap-1.5 transition-colors hover:text-[#9b84d8]">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                        {post.comments || '700'}
                    </button>
                    <button type="button" className="flex items-center justify-center transition-colors hover:text-[#9b84d8]">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

