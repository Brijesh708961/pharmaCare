import React from 'react';
import { useNavigate } from 'react-router-dom';
import GeneticCompatibilityChecker from '../components/GeneticCompatibilityChecker';

const Compatibility = ({ darkMode }) => {
  const navigate = useNavigate();

  return (
    <GeneticCompatibilityChecker
      darkMode={darkMode}
      onBack={() => {
        navigate('/');
        window.scrollTo(0, 0);
      }}
    />
  );
};

export default Compatibility;
