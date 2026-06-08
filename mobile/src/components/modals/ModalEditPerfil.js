/**
 * ModalEditPerfil - Modal for editing user profile
 * 
 * @component
 * @example
 * <ModalEditPerfil
 *   isVisible={isModalVisible}
 *   currentUser={user}
 *   onClose={() => setIsModalVisible(false)}
 *   onSuccess={(updatedUser) => {
 *     console.log('Perfil atualizado:', updatedUser);
 *   }}
 * />
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ModalContainer from './ModalContainer';

/**
 * Modal for editing user profile data
 * Currently supports name and email editing
 */
const ModalEditPerfil = ({ isVisible, currentUser, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define field definitions dynamically based on current user
  const fieldDefinitions = useMemo(() => [
    {
      id: 'name',
      label: 'Nome',
      type: 'text',
      placeholder: 'Seu nome',
      required: true,
      validation: /^.{3,100}$/,
      errorMessage: 'Nome deve ter 3-100 caracteres',
      defaultValue: currentUser?.name || '',
    },
    {
      id: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'seu@email.com',
      required: true,
      validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Email inválido',
      defaultValue: currentUser?.email || '',
    },
  ], [currentUser]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // For now, this is a local validation only
      // The actual API endpoint for profile update can be added later
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
      };

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Close modal and call success callback
      setLoading(false);
      onClose();
      onSuccess(updatedUser);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao atualizar perfil');
    }
  };

  return (
    <ModalContainer
      isVisible={isVisible}
      title="Editar Perfil"
      fields={fieldDefinitions}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitButtonLabel="Salvar"
      cancelButtonLabel="Cancelar"
    />
  );
};

ModalEditPerfil.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ModalEditPerfil;
