/**
 * ModalContainer - Base reusable modal component
 * Encapsulates common modal behavior: opening, closing, validation, loading, error handling
 * 
 * @component
 * @example
 * const fieldDefinitions = [
 *   { id: 'nome', label: 'Nome', type: 'text', required: true }
 * ];
 * 
 * <ModalContainer
 *   isVisible={true}
 *   title="Criar Talhão"
 *   fields={fieldDefinitions}
 *   onClose={() => setVisible(false)}
 *   onSubmit={handleSubmit}
 *   loading={false}
 *   error={null}
 * />
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Platform, Picker
} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../theme/colors';
import { validateField, validateAllFields } from '../../utils/modalValidation';

const ModalContainer = ({
  isVisible,
  title,
  fields,
  onClose,
  onSubmit,
  loading = false,
  error = null,
  submitButtonLabel = 'Confirmar',
  cancelButtonLabel = 'Cancelar',
}) => {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [internalError, setInternalError] = useState(error);
  const debounceTimeouts = useRef({});

  // Initialize formData with default values and empty values
  useEffect(() => {
    const initialData = {};
    fields.forEach((field) => {
      initialData[field.id] = field.defaultValue || '';
    });
    setFormData(initialData);
    setValidationErrors({});
  }, [fields, isVisible]);

  // Update internal error when prop changes
  useEffect(() => {
    setInternalError(error);
  }, [error]);

  /**
   * Handles field value changes with debounced validation
   */
  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error for this field
    setInternalError(null);

    // Clear previous timeout for this field
    if (debounceTimeouts.current[fieldId]) {
      clearTimeout(debounceTimeouts.current[fieldId]);
    }

    // Set new debounced validation (300ms)
    debounceTimeouts.current[fieldId] = setTimeout(() => {
      const field = fields.find(f => f.id === fieldId);
      if (field) {
        const result = validateField(fieldId, value, field);
        setValidationErrors(prev => ({
          ...prev,
          [fieldId]: result.isValid ? null : result.errorMessage,
        }));
      }
    }, 300);
  };

  /**
   * Handles form submission with full validation
   */
  const handleSubmit = async () => {
    // Validate all fields
    const { isValid, errors } = validateAllFields(formData, fields);

    if (!isValid) {
      setValidationErrors(errors);
      setInternalError('Preencha todos os campos obrigatórios');
      return;
    }

    // Call parent submit handler
    try {
      await onSubmit(formData);
    } catch (err) {
      setInternalError(err.message || 'Erro ao processar');
    }
  };

  /**
   * Handles modal close
   */
  const handleClose = () => {
    setFormData({});
    setValidationErrors({});
    setInternalError(null);
    Object.values(debounceTimeouts.current).forEach(timeout => clearTimeout(timeout));
    onClose();
  };

  /**
   * Renders input component based on field type
   */
  const renderFieldInput = (field) => {
    const value = formData[field.id] || '';
    const error = validationErrors[field.id];
    const hasError = error !== null && error !== undefined;
    const isDisabled = loading;

    const commonInputStyle = [
      styles.input,
      hasError && styles.inputError,
      isDisabled && styles.inputDisabled,
    ];

    switch (field.type) {
      case 'number':
        return (
          <TextInput
            style={commonInputStyle}
            placeholder={field.placeholder || '0'}
            keyboardType="decimal-pad"
            value={String(value)}
            onChangeText={v => handleFieldChange(field.id, v)}
            editable={!isDisabled}
            placeholderTextColor={colors.textLight}
            accessibilityLabel={field.label}
            accessibilityHint={hasError ? error : undefined}
          />
        );

      case 'date':
        return (
          <TouchableOpacity
            style={commonInputStyle}
            onPress={() => {
              // Date picker implementation would go here
              // For now, user types manually
            }}
            disabled={isDisabled}
            accessibilityLabel={field.label}
            accessibilityHint={hasError ? error : undefined}
          >
            <TextInput
              style={styles.dateInput}
              placeholder={field.placeholder || 'DD/MM/YYYY'}
              value={String(value)}
              onChangeText={v => handleFieldChange(field.id, v)}
              editable={!isDisabled}
              pointerEvents="none"
              placeholderTextColor={colors.textLight}
            />
          </TouchableOpacity>
        );

      case 'select':
      case 'picker':
        return (
          <View
            style={[commonInputStyle, styles.pickerContainer]}
            accessible={true}
            accessibilityLabel={field.label}
            accessibilityHint={hasError ? error : undefined}
          >
            <Picker
              selectedValue={value}
              onValueChange={v => handleFieldChange(field.id, v)}
              enabled={!isDisabled}
              style={styles.picker}
              dropdownIconRippleColor={isDisabled ? 'transparent' : colors.primary}
            >
              <Picker.Item label={field.placeholder || 'Selecione...'} value="" />
              {field.options && field.options.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
        );

      case 'text':
      default:
        return (
          <TextInput
            style={commonInputStyle}
            placeholder={field.placeholder || ''}
            value={String(value)}
            onChangeText={v => handleFieldChange(field.id, v)}
            editable={!isDisabled}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            placeholderTextColor={colors.textLight}
            accessibilityLabel={field.label}
            accessibilityHint={hasError ? error : undefined}
          />
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      accessibilityRole="dialog"
      accessible={true}
      accessibilityLabel={`Modal: ${title}`}
    >
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar modal"
      >
        {/* Modal Container */}
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing on inner press
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              accessibilityHint="Fecha este modal"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {internalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{internalError}</Text>
            </View>
          )}

          {/* Form Fields */}
          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={fields.length > 4}
          >
            {fields.map((field) => {
              const error = validationErrors[field.id];
              const hasError = error !== null && error !== undefined;

              return (
                <View key={field.id} style={styles.fieldWrapper}>
                  <Text style={styles.label}>
                    {field.label}
                    {field.required ? '' : ' (Opcional)'}
                  </Text>
                  {renderFieldInput(field)}
                  {hasError && (
                    <Text style={styles.fieldErrorText}>{error}</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={cancelButtonLabel}
              accessibilityHint={loading ? 'Desabilitado durante processamento' : undefined}
            >
              <Text style={styles.cancelButtonText}>{cancelButtonLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={submitButtonLabel}
              accessibilityHint={loading ? 'Enviando...' : 'Submete o formulário'}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Enviando...</Text>
                </>
              ) : (
                <Text style={styles.submitButtonText}>{submitButtonLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

ModalContainer.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'number', 'date', 'select', 'picker']).isRequired,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      validation: PropTypes.instanceOf(RegExp),
      errorMessage: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      defaultValue: PropTypes.any,
      multiline: PropTypes.bool,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  submitButtonLabel: PropTypes.string,
  cancelButtonLabel: PropTypes.string,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.cardWhite,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
    accessibilityRole: 'button',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '300',
  },
  errorContainer: {
    backgroundColor: colors.danger + '15',
    borderTopWidth: 1,
    borderTopColor: colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: '70%',
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
    backgroundColor: colors.inputBg,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '08',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#F0F0F0',
  },
  dateInput: {
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },
  pickerContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textDark,
  },
  fieldErrorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ModalContainer;
