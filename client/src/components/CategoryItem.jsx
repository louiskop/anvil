import React from 'react';
import { GoCheck } from "react-icons/go";

const CategoryItem = ({ categoryName, filterState, filterNotes }) => {
    return (
        <li className="w-full" onClick={() => filterNotes(categoryName)}>
            <span className="flex w-full">
                <div className="flex-1">{categoryName}</div>
                {filterState === categoryName ? <GoCheck size={16} /> : <></>}
            </span>
        </li>
    );
};

export default CategoryItem;