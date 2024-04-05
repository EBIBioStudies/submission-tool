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
  section.accno = `${tmpl.name}-${id}`.replace(' ', '-').toLowerCase();
  id += 1;
  if(section.type === 'Link'){
    section.url = ''
  }
  if(section.type === 'File'){
    section.path = ''
  }
  // fill attributes
  section.attributes = [];
  [...(tmpl?.fieldTypes ?? []), ...(tmpl?.columnTypes ?? [])].forEach((field) => {
    const attr = { name: field.name };
    if (field?.controlType?.defaultValue) {
      attr.value = field?.controlType?.defaultValue;
      if (field?.controlType?.values?.filter((value) => value?.valqual != null).length) {
        attr.valqual = field?.controlType?.values?.find((v) => v.value === attr.value)?.valqual;
      }
    } else if (field?.controlType?.name === 'select') attr.value = ''; else if (field?.controlType?.name === 'reference') attr.reference = true;
    section.attributes.push(attr);
  });

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
