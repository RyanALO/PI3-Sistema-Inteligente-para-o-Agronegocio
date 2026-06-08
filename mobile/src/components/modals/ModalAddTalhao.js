/**
 * ModalAddTalhao - Modal for creating new plots (talhões)
 * 
 * @component
 * @example
 * <ModalAddTalhao
 *   isVisible={isModalVisible}
 *   fazenda_id={fazendaId}
 *   onClose={() => setIsModalVisible(false)}
 *   onSuccess={(newTalhao) => {
 *     console.log('Talhão criado:', newTalhao);
 *     // Reload list or update state
 *   }}
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModalContainer from './ModalContainer';
import { addTalhao } from '../../services/api';
import { formatDateToISO, parseNumberField } from '../../utils/modalValidation';

const fieldDefinitions = [
  {
    id: 'nome',
    label: 'Nome do Talhão',
    type: 'text',
    placeholder: 'Ex: Talhão Norte',
    required: true,
    validation: /^.{3,50}$/,
    errorMessage: 'Nome deve ter 3-50 caracteres',
  },
  {
    id: 'cultura',
    label: 'Cultura',
    type: 'text',
    placeholder: 'Ex: Soja',
    required: true,
    validation: /^.{2,30}$/,
    errorMessage: 'Cultura deve ter 2-30 caracteres',
  },
  {
    id: 'area',
    label: 'Área (hectares)',
    type: 'number',
    placeholder: '0.00',
    required: true,
    validation: /^\d+(\.\d{1,2})?$/,
    errorMessage: 'Área deve ser número positivo',
  },
  {
    id: 'data_plantio',
    label: 'Data de Plantio',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
    required: true,
    errorMessage: 'Data inválida',
  },
  {
    id: 'data_colheita',
    label: 'Data de Colheita',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
    required: false,
    errorMessage: 'Data inválida',
  },
];

/**
 * Modal for creating a new plot (talhão)
 */
const ModalAddTalhao = ({ isVisible, fazenda_id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Format dates
      const payload = {
        nome: formData.nome,
        cultura: formData.cultura,
        area: parseNumberField(formData.area),
        data_plantio: formatDateToISO(formData.data_plantio),
        data_colheita: formData.data_colheita ? formatDateToISO(formData.data_colheita) : null,
      };

      // Call API
      const result = await addTalhao(fazenda_id, payload);

      // Close modal and call success callback
      setLoading(false);
      onClose();
      onSuccess(result);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao criar talhão');
    }
  };

  return (
    <ModalContainer
      isVisible={isVisible}
      title="Adicionar Talhão"
      fields={fieldDefinitions}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitButtonLabel="Criar Talhão"
      cancelButtonLabel="Cancelar"
    />
  );
};

ModalAddTalhao.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  fazenda_id: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ModalAddTalhao;
