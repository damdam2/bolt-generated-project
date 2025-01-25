export function extractFirstNameFromEmail(email) {
      if (!email) return '';
      const parts = email.split('@')[0].split('.');
      return parts[0] || '';
    }

    export function sortByDate(array, property, order = 'desc') {
      return [...array].sort((a, b) => {
        const dateA = a[property] ? new Date(a[property]) : new Date(0);
        const dateB = b[property] ? new Date(b[property]) : new Date(0);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }
