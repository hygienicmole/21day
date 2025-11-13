import csvParser from 'csv-parser';
import { Readable } from 'stream';

export function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];

    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (data) => {
        // Validate required fields
        if (!data.name && !data.Name) {
          errors.push(`Missing name in row: ${JSON.stringify(data)}`);
          return;
        }

        const contact = {
          name: data.name || data.Name,
          email: data.email || data.Email || '',
          phone: data.phone || data.Phone || '',
          whatsapp: data.whatsapp || data.WhatsApp || data.phone || data.Phone || '',
          company: data.company || data.Company || '',
          title: data.title || data.Title || ''
        };

        results.push(contact);
      })
      .on('end', () => {
        resolve({ contacts: results, errors });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
