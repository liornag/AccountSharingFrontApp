import React from 'react';
import { useLocation } from 'react-router-dom';

const SelectItems = () => {
  const location = useLocation();
  const items = location.state?.items || [];

  const handleCheckboxChange = (index) => {
    const updatedItems = [...items];
    updatedItems[index].selected = !updatedItems[index].selected;
    // אין כאן סטייט כי לא נדרש מעבר לדפים אחרים כרגע
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Select Items You Ordered</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                onChange={() => handleCheckboxChange(index)}
              />
              {item.name} - ₪{item.price}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectItems;
