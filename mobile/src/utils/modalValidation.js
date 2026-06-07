/**
 * Modal Validation Utilities
 * Provides reusable validation functions for modal forms
 * 
 * @module modalValidation
 */

/**
 * Validates a single field based on its definition
 * @param {string} fieldId - Unique identifier for the field
 * @param {*} value - The value to validate
 * @param {Object} fieldDefinition - Field configuration object
 * @param {string} fieldDefinition.type - Type of field (text, number, date, select, picker)
 * @param {boolean} fieldDefinition.required - Whether field is required
 * @param {RegExp} [fieldDefinition.validation] - Optional regex for validation
 * @returns {Object} { isValid: boolean, errorMessage: string | null }
 * 
 * @example
 * const fieldDef = { 
 *   id: 'nome', 
 *   type: 'text', 
 *   required: true, 
 *   validation: /^.{3,50}$/,
 *   errorMessage: 'Nome deve ter 3-50 caracteres'
 * };
 * const result = validateField('nome', 'João Silva', fieldDef);
 * console.log(result); // { isValid: true, errorMessage: null }
 */
export function validateField(fieldId, value, fieldDefinition) {
  // Step 1: Validate required fields
  if (fieldDefinition.required) {
    if (value === null || value === '' || value === undefined) {
      return {
        isValid: false,
        errorMessage: fieldDefinition.errorMessage || 'Campo obrigatório',
      };
    }
  }

  // Step 2: If field is optional and empty, it's valid
  if (!fieldDefinition.required && (value === null || value === '' || value === undefined)) {
    return {
      isValid: true,
      errorMessage: null,
    };
  }

  // Step 3: Validate by type
  switch (fieldDefinition.type) {
    case 'text':
      if (fieldDefinition.validation) {
        const isValidText = fieldDefinition.validation.test(String(value));
        if (!isValidText) {
          return {
            isValid: false,
            errorMessage: fieldDefinition.errorMessage || 'Formato inválido',
          };
        }
      }
      return { isValid: true, errorMessage: null };

    case 'number': {
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue)) {
        return {
          isValid: false,
          errorMessage: fieldDefinition.errorMessage || 'Deve ser um número',
        };
      }
      if (numValue < 0) {
        return {
          isValid: false,
          errorMessage: fieldDefinition.errorMessage || 'Número deve ser positivo',
        };
      }
      if (fieldDefinition.validation) {
        const isValidNumber = fieldDefinition.validation.test(String(value));
        if (!isValidNumber) {
          return {
            isValid: false,
            errorMessage: fieldDefinition.errorMessage || 'Formato inválido',
          };
        }
      }
      return { isValid: true, errorMessage: null };
    }

    case 'date': {
      // Accept various date formats
      const dateStr = String(value).trim();
      if (!isValidDate(dateStr)) {
        return {
          isValid: false,
          errorMessage: fieldDefinition.errorMessage || 'Data inválida',
        };
      }
      return { isValid: true, errorMessage: null };
    }

    case 'select':
    case 'picker': {
      if (fieldDefinition.options) {
        const validOptions = fieldDefinition.options.map(opt => opt.value);
        if (!validOptions.includes(value)) {
          return {
            isValid: false,
            errorMessage: fieldDefinition.errorMessage || 'Opção inválida',
          };
        }
      }
      return { isValid: true, errorMessage: null };
    }

    default:
      return { isValid: true, errorMessage: null };
  }
}

/**
 * Validates all fields in a form
 * @param {Object} formData - Object containing field values
 * @param {Array<Object>} fieldDefinitions - Array of field definition objects
 * @returns {Object} { isValid: boolean, errors: { [fieldId]: errorMessage } }
 * 
 * @example
 * const formData = { nome: 'João', cultura: 'So', area: 100 };
 * const fields = [...fieldDefinitions];
 * const result = validateAllFields(formData, fields);
 * // { 
 * //   isValid: false, 
 * //   errors: { cultura: 'Cultura deve ter 2-30 caracteres' }
 * // }
 */
export function validateAllFields(formData, fieldDefinitions) {
  const errors = {};
  let isValid = true;

  fieldDefinitions.forEach((field) => {
    const value = formData[field.id];
    const result = validateField(field.id, value, field);

    if (!result.isValid) {
      isValid = false;
      errors[field.id] = result.errorMessage;
    }
  });

  return { isValid, errors };
}

/**
 * Converts a date string or Date object to ISO 8601 format (YYYY-MM-DD)
 * @param {string|Date|null} dateInput - Input date (DD/MM/YYYY string, Date object, or null)
 * @returns {string|null} ISO 8601 formatted date string or null
 * @throws {Error} If date is invalid
 * 
 * @example
 * formatDateToISO('25/12/2023'); // '2023-12-25'
 * formatDateToISO(new Date('2023-12-25')); // '2023-12-25'
 * formatDateToISO(null); // null
 */
export function formatDateToISO(dateInput) {
  if (dateInput === null || dateInput === undefined) {
    return null;
  }

  let date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    // Try to parse DD/MM/YYYY format
    const ddmmyyyyMatch = dateInput.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      date = new Date(year, parseInt(month, 10) - 1, day);
    } else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Already in ISO format
      date = new Date(dateInput);
    } else {
      throw new Error(`Formato de data inválido: ${dateInput}. Use DD/MM/YYYY ou YYYY-MM-DD`);
    }
  } else {
    throw new Error(`Tipo de data inválido: ${typeof dateInput}`);
  }

  // Validate date
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Data inválida: ${dateInput}`);
  }

  // Format as ISO 8601 (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parses a number field value from string to number
 * @param {string|number|null} value - Input value to parse
 * @returns {number|null} Parsed number or null if invalid
 * 
 * @example
 * parseNumberField('123.45'); // 123.45
 * parseNumberField('123'); // 123
 * parseNumberField('abc'); // null
 * parseNumberField(null); // null
 */
export function parseNumberField(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numValue = parseFloat(value);
  return Number.isNaN(numValue) ? null : numValue;
}

/**
 * Checks if a string is a valid date in supported formats
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if date is valid
 * 
 * @internal
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }

  // Check DD/MM/YYYY format
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const d = new Date(year, parseInt(month, 10) - 1, day);
    return d.getFullYear() === parseInt(year, 10)
      && d.getMonth() === parseInt(month, 10) - 1
      && d.getDate() === parseInt(day, 10);
  }

  // Check YYYY-MM-DD format
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const d = new Date(year, parseInt(month, 10) - 1, day);
    return d.getFullYear() === parseInt(year, 10)
      && d.getMonth() === parseInt(month, 10) - 1
      && d.getDate() === parseInt(day, 10);
  }

  return false;
}
