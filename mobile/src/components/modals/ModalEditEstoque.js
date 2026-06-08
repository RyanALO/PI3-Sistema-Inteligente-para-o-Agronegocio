/**
 * ModalEditEstoque - Modal for editing existing stock items
 * 
 * @component
 * @example
 * <ModalEditEstoque
 *   isVisible={isModalVisible}
 *   itemId={item.id}
 *   item={item}
 *   onClose={() => setIsModalVisible(false)}
 *   onSuccess={(updatedItem) => {
 *     console.log('Item atualizado:', updatedItem);
 *   }}
 * />
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ModalContainer from './ModalContainer';
import { updateEstoque } from '../../services/api';
import { parseNumberField } from '../../utils/modalValidation';

/**
 * Modal for editing an existing stock item (quantidade and custo_unitario only)
 */
const ModalEditEstoque = ({ isVisible, itemId, item, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define field definitions dynamically based on item
  const fieldDefinitions = useMemo(() => [
    {
      id: 'quantidade',
      label: 'Quantidade (kg)',
      type: 'number',
      placeholder: '0.00',
      required: true,
      validation: /^\d+(\.\d{1,2})?$/,
      errorMessage: 'Quantidade deve ser número positivo',
      defaultValue: item?.quantidade ? String(item.quantidade) : '',
    },
    {
      id: 'custo_unitario',
      label: 'Custo Unitário (R$)',
      type: 'number',
      placeholder: '0.00',
      required: false,
      validation: /^\d+(\.\d{1,2})?$/,
      errorMessage: 'Custo deve ser número válido',
      defaultValue: item?.custo_unitario ? String(item.custo_unitario) : '',
    },
  ], [item]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare payload with only modified fields
      const payload = {
        quantidade: parseNumberField(formData.quantidade),
        custo_unitario: parseNumberField(formData.custo_unitario),
      };

      // Call API
      const result = await updateEstoque(itemId, payload);

      // Close modal and call success callback
      setLoading(false);
      onClose();
      onSuccess(result);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao atualizar estoque');
    }
  };

  return (
    <ModalContainer
      isVisible={isVisible}
      title="Editar Estoque"
      fields={fieldDefinitions}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitButtonLabel="Atualizar"
      cancelButtonLabel="Cancelar"
    />
  );
};

ModalEditEstoque.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  itemId: PropTypes.number.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    quantidade: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    custo_unitario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ModalEditEstoque;
