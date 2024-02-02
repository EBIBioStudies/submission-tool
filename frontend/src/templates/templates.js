import ArrayExpress from '@/templates/ArrayExpress.json';
import Default from '@/templates/Default.json';
import BioImagesv1 from "@/templates/BioImages.v1.json";
import BioImagesv4 from "@/templates/BioImages.v4.json";
import BioImagesv5 from "@/templates/BioImages.v5.json";
import MicrobioRaman from "@/templates/MicrobioRaman.json";
export const allTemplates = [BioImagesv1, BioImagesv4, BioImagesv5, Default, MicrobioRaman, ArrayExpress ]
const nameLatestVersionMap = new Map()
const nameTemplateMap = new Map()
allTemplates.map((tmpl, i) => {
  const templateNameRe = /^(.+?)(?:\.v(\d+))?$/;
  let [_, collection, version] = templateNameRe.exec(tmpl.name) || [null, '', 0];
  version = Number(version) || 0;
  nameTemplateMap.set(`${collection}.v${version}`, tmpl);
  if (!nameLatestVersionMap.has(collection) || nameLatestVersionMap.get(collection) < version) {
    nameLatestVersionMap.set(collection, version);
  }
})

export const latestTemplates = [...nameLatestVersionMap.keys()].map((collection) => nameTemplateMap.get(`${collection}.v${nameLatestVersionMap.get(collection)}`))
//TODO: Filter on user collection allow list

let id = 0;

// fill attributes and subsections of a given section according to the given template
export const fillTemplate = (section, tmpl) => {
  section.type = tmpl.name
  section.accno = `${tmpl.name}-${id}`.replace(' ','-').toLowerCase();
  id += 1;
  // fill attributes
  section.attributes = [];
  [...(tmpl?.fieldTypes ?? []), ...(tmpl?.columnTypes ?? [])].forEach(
    (field) => {
      const attr = {name: field.name};
      if (field?.controlType?.defaultValue) {
        attr.value = field?.controlType?.defaultValue;
        if (field?.controlType?.values?.filter((value) => value?.valqual != null).length) {
          attr.valqual = field?.controlType?.values?.find((v) => v.value === attr.value)?.valqual
        }
      } else if (field?.controlType?.name === 'select')
        attr.value = '';
      else if (field?.controlType?.name === 'reference')
        attr.reference = true
      section.attributes.push(attr);
    },
  );

  // fill sections
  [...(tmpl?.tableTypes ?? []), ...(tmpl?.sectionTypes ?? [])].forEach(
    (sectionTemplate) => {
      if (sectionTemplate?.name==='Contact') return
      const subsection = {type: sectionTemplate.name};
      if (subsection.type?.toLowerCase()==='file') {
        if (!section.files) section.files = [];
        section.files.push(subsection);
      } else {
        if (!section.subsections) section.subsections = [];
        section.subsections.push(subsection);
      }
      fillTemplate(subsection, sectionTemplate);
    },
  );
}
