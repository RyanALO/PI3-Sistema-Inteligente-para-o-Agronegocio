/**
 * ModalAddMembro - Modal for adding a new team member
 *
 * @component
 * @example
 * <ModalAddMembro
 *   isVisible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   onSuccess={(novoMembro) => addMembro(novoMembro)}
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModalContainer from './ModalContainer';

const fieldDefinitions = [
  {
    id: 'nome',
    label: 'Nome do Membro',
    type: 'text',
    placeholder: 'Ex: João Silva',
    required: true,
    validation: /^.{3,60}$/,
    errorMessage: 'Nome deve ter 3-60 caracteres',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'membro@email.com',
    required: false,
    validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Email inválido',
  },
];

/**
 * Generates initials from a full name (max 2 chars)
 */
function getIniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Modal for adding a new team member to the farm
 */
const ModalAddMembro = ({ isVisible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const novoMembro = {
        id: Date.now(),
        nome: formData.nome,
        email: formData.email || null,
        iniciais: getIniciais(formData.nome),
      };

      setLoading(false);
      onClose();
      onSuccess(novoMembro);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao adicionar membro');
    }
  };

  return (
    <ModalContainer
      isVisible={isVisible}
      title="Adicionar Membro"
      fields={fieldDefinitions}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitButtonLabel="Adicionar"
      cancelButtonLabel="Cancelar"
    />
  );
};

ModalAddMembro.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ModalAddMembro;
