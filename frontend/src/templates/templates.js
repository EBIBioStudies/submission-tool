import ArrayExpress from '@/templates/ArrayExpress.json';
import Default from '@/templates/Default.json';
import Defaultv2 from '@/templates/Default.v2.json';
import BioImagesv1 from '@/templates/BioImages.v1.json';
import BioImagesv4 from '@/templates/BioImages.v4.json';
import BioImagesv5 from '@/templates/BioImages.v5.json';
import MicrobioRaman from '@/templates/MicrobioRaman.json';
import BioImagesMIFAv1 from '@/templates/BioImages.MIFA.v1.json';

export const allTemplates = [
  BioImagesv5,
  BioImagesv4,
  BioImagesv1,
  Defaultv2,
  MicrobioRaman,
  ArrayExpress,
  BioImagesMIFAv1,
  Default,
];

function getRandomSuffix(length = 4) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function normalizeAccno(name) {
  return (name || 'n')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')         // spaces → dashes
    .replace(/[^a-z0-9\-]/g, '')  // remove punctuation & _
    .replace(/\-+/g, '-')         // collapse multiple dashes
    .replace(/^-+|-+$/g, '');     // trim dashes
}

export const activeTemplates = [
  // Keep the same order that we want these templates to appear in the new submission dialogue
  // Higher versions should be kept on top
  BioImagesv5,
  Defaultv2,
  MicrobioRaman,
  BioImagesMIFAv1
];

let id = 0;

// fill attributes and subsections of a given section according to the given template
export const fillTemplate = (section, tmpl) => {
  section.type = tmpl.name;
  const normalized = normalizeAccno(tmpl.name);
  const prefix = normalized.length <= 5 ? normalized : normalized.substring(0, 4);
  section.accno = `${prefix}-${id}-${getRandomSuffix(4)}`;
  id += 1;
  if(section.type === 'Link'){
    section.url = ''
  }
  if(section.type === 'File'){
    section.path = ''
  }
  // fill attributes
  section.attributes = [];
  for (const field of [...(tmpl?.fieldTypes ?? []), ...(tmpl?.columnTypes ?? [])]) {
    if(field.name === 'Link' || field.name==='File')
      continue;
    const attr = { name: field.name };
    if (field?.controlType?.defaultValue) {
      attr.value = field?.controlType?.defaultValue;
      if (field?.controlType?.values?.filter((value) => value?.valqual != null).length) {
        attr.valqual = field?.controlType?.values?.find((v) => v.value === attr.value)?.valqual;
      }
    } else if (field?.controlType?.name === 'select') attr.value = '';
    section.attributes.push(attr);
  };

  // fill sections
  [...(tmpl?.tableTypes ?? []), ...(tmpl?.sectionTypes ?? [])].forEach((sectionTemplate) => {
    if (sectionTemplate?.name === 'Contact') return;
    const subsection = { type: sectionTemplate.name };
    if (subsection.type?.toLowerCase() === 'file') {
      if (!section.files) section.files = [];
      section.files.push(subsection);
    } else if (subsection.type?.toLowerCase() === 'link') {
      if (!section.links) section.links = [];
      section.links.push(subsection);
    }else {
      if (!section.subsections) section.subsections = [];
      section.subsections.push(subsection);
    }
    fillTemplate(subsection, sectionTemplate);
  });
};
