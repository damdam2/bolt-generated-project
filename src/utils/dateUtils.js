let logs = [];

    export function formatDate(dateString) {
      if (!dateString) {
        console.error("formatDate: dateString is null or undefined");
        return '';
      }
      try {
        let date;
        if (typeof dateString === 'string') {
          if (dateString.includes('T')) {
            date = new Date(dateString);
          } else {
            const parts = dateString.split('-');
            if (parts.length === 3) {
              date = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              console.error("formatDate: Invalid date format:", dateString);
              return '';
            }
          }
        } else if (dateString instanceof Date) {
          date = dateString;
        } else {
          console.error("formatDate: Invalid date type:", dateString);
          return '';
        }
        if (isNaN(date)) {
          console.error("formatDate: Invalid date:", dateString);
          return '';
        } else {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        }
      } catch (error) {
        console.error("formatDate: Error during date formatting:", error, "dateString:", dateString);
        return '';
      }
    }

    export function getLogs() {
      return logs;
    }

    export function clearLogs() {
      logs = [];
    }
