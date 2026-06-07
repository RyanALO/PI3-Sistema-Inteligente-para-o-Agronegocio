/**
 * ModalAddEstoque - Modal for creating new stock items
 * 
 * @component
 * @example
 * <ModalAddEstoque
 *   isVisible={isModalVisible}
 *   fazenda_id={fazendaId}
 *   onClose={() => setIsModalVisible(false)}
 *   onSuccess={(newItem) => {
 *     console.log('Item adicionado:', newItem);
 *   }}
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModalContainer from './ModalContainer';
import { addEstoque } from '../../services/api';
import { formatDateToISO, parseNumberField } from '../../utils/modalValidation';

const fieldDefinitions = [
  {
    id: 'nome_produto',
    label: 'Nome do Produto',
    type: 'text',
    placeholder: 'Ex: Adubo NPK',
    required: true,
    validation: /^.{3,60}$/,
    errorMessage: 'Nome deve ter 3-60 caracteres',
  },
  {
    id: 'tipo',
    label: 'Tipo',
    type: 'select',
    placeholder: 'Selecione um tipo',
    required: true,
    options: [
      { value: 'fertilizante', label: 'Fertilizante' },
      { value: 'pesticida', label: 'Pesticida' },
      { value: 'herbicida', label: 'Herbicida' },
      { value: 'fungicida', label: 'Fungicida' },
      { value: 'inseticida', label: 'Inseticida' },
      { value: 'outro', label: 'Outro' },
    ],
    errorMessage: 'Tipo é obrigatório',
  },
  {
    id: 'quantidade',
    label: 'Quantidade (kg)',
    type: 'number',
    placeholder: '0.00',
    required: true,
    validation: /^\d+(\.\d{1,2})?$/,
    errorMessage: 'Quantidade deve ser número positivo',
  },
  {
    id: 'custo_unitario',
    label: 'Custo Unitário (R$)',
    type: 'number',
    placeholder: '0.00',
    required: false,
    validation: /^\d+(\.\d{1,2})?$/,
    errorMessage: 'Custo deve ser número válido',
  },
  {
    id: 'data_validade',
    label: 'Data de Validade',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
    required: false,
    errorMessage: 'Data inválida',
  },
  {
    id: 'fornecedor',
    label: 'Fornecedor',
    type: 'text',
    placeholder: 'Ex: BASF',
    required: false,
    validation: /^.{0,50}$/,
    errorMessage: 'Fornecedor máx 50 caracteres',
  },
];

/**
 * Modal for creating a new stock item
 */
const ModalAddEstoque = ({ isVisible, fazenda_id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = {
        fazenda_id,
        nome_produto: formData.nome_produto,
        tipo: formData.tipo,
        quantidade: parseNumberField(formData.quantidade),
        custo_unitario: parseNumberField(formData.custo_unitario),
        data_validade: formData.data_validade ? formatDateToISO(formData.data_validade) : null,
        fornecedor: formData.fornecedor || null,
      };

      // Call API
      const result = await addEstoque(payload);

      // Close modal and call success callback
      setLoading(false);
      onClose();
      onSuccess(result);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao adicionar estoque');
    }
  };

  return (
    <ModalContainer
      isVisible={isVisible}
      title="Adicionar Estoque"
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

ModalAddEstoque.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  fazenda_id: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ModalAddEstoque;
