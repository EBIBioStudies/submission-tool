import ArrayExpress from '@/templates/ArrayExpress.json';
import Default from '@/templates/Default.json';
import BioImagesv1 from "@/templates/BioImages.v1.json";
import BioImagesv4 from "@/templates/BioImages.v4.json";
export const allTemplates = [BioImagesv1, BioImagesv4, Default, ArrayExpress]
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

