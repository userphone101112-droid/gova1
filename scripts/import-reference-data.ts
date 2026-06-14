import fs from 'fs';

import { db } from '../src/lib/db';
import { forms, strengths } from '../src/lib/db/schema';

const referenceDataPath =
  'C:/Users/hesham/Desktop/suez-bazaar-devolper/shared/pharmList/reference_data.json';

async function importReferenceData() {
  console.log('Starting reference data import...');

  const referenceData = JSON.parse(fs.readFileSync(referenceDataPath, 'utf-8'));

  // Insert forms
  for (const form of referenceData.forms) {
    await db.insert(forms).values({
      id: form.id,
      nameAr: form.name.ar,
      nameEn: form.name.en,
    });
  }

  // Insert strengths
  for (const strength of referenceData.strengths) {
    await db.insert(strengths).values({
      id: strength.id,
      nameAr: strength.name.ar,
      nameEn: strength.name.en,
    });
  }

  console.log('Reference data import completed!');
}

importReferenceData().catch(console.error);
