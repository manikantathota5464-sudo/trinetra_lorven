import React from 'react';

interface StateEmblemProps {
  className?: string;
  color?: string;
}

export const StateEmblem: React.FC<StateEmblemProps> = ({
  className = "h-12 w-auto",
}) => {
  return (
    <img
      src="./assets/login/emblem_clean_no_black.png"
      alt="State Emblem of India"
      className={`${className} object-contain select-none flex-shrink-0`}
    />
  );
};
