import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ZeroGPortal } from '../components/ZeroGPortal';
import { useArchive } from '../context/ArchiveContext';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { enterPortal } = useArchive();

  const handleEnter = () => {
    enterPortal();
    navigate('/', { replace: true });
  };

  return <ZeroGPortal onEnter={handleEnter} />;
};
