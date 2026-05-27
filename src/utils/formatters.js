export const formatDOB = text => {

  const cleaned = text.replace(/\D/g, '');

  let formatted = cleaned;

  if (cleaned.length > 2) {

    formatted =
      cleaned.slice(0, 2) +
      '/' +
      cleaned.slice(2);

  }

  if (cleaned.length > 4) {

    formatted =
      cleaned.slice(0, 2) +
      '/' +
      cleaned.slice(2, 4) +
      '/' +
      cleaned.slice(4, 8);

  }

  return formatted;
};

export const convertDOBToUI =
  dob => {

    if (!dob) {
      return '';
    }

    // Already UI format

    if (dob.includes('/')) {
      return dob;
    }

    // API format YYYY-MM-DD

    if (dob.includes('-')) {

      const parts =
        dob.split('-');

      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return dob;
  };