import { PageTab } from '@/models/PageTab.model.ts';
import { ensureArray } from '@/utils.ts';

function cleanTopLevelAttributes(section: PageTab.Section) {
  if (Array.isArray(section.attributes)) {
    section.attributes = section.attributes.filter(attr => {
      return !(
        attr &&
        typeof attr === 'object' &&
        'name' in attr &&
        (
          !('value' in attr) ||
          attr.value === null ||
          (typeof attr.value === 'string' && attr.value.trim() === '')
        )
      );
    });
  }
  return section;
}

function cleanSubsectionAttributes(section: PageTab.Section) {
  if (Array.isArray(section.subsections)) {
    section.subsections?.forEach(sub => {
      if (!Array.isArray(sub) && Array.isArray(sub.attributes)) {
        sub.attributes = sub.attributes.filter(attr => {
          return !(
            attr &&
            typeof attr === 'object' &&
            'name' in attr &&
            (
              !('value' in attr) ||
              attr.value === null ||
              (typeof attr.value === 'string' && attr.value.trim() === '')
            )
          );
        });
      }
    });
  }
  return section;
}

function groupSubsections(section: PageTab.Section) {
  if (!Array.isArray(section.subsections)) return section;

  const typeToGroup = new Map<string, { index: number, list: PageTab.Section[] }>();

  section.subsections?.flatMap(ensureArray)?.forEach((sub, idx) => {
    const type = sub.type || sub.name || '__unknown__';
    if (!typeToGroup.has(type)) typeToGroup.set(type, { index: idx, list: [] });
    typeToGroup.get(type)!.list.push(sub);
  });

  section.subsections = Array.from(typeToGroup.entries())
    .sort((a, b) => a[1].index - b[1].index)
    .flatMap(entry => entry[1].list);

  return section;
}

function cleanStudyComponentAssociations(section: PageTab.Section) {
  if (Array.isArray(section.subsections)) {
    section.subsections?.flatMap(ensureArray)?.forEach(sub => {
      if (sub.type === 'Study Component' && Array.isArray(sub.subsections)) {
        sub.subsections?.flatMap(ensureArray)?.forEach(nested => {
          if (nested.type === 'Associations' && Array.isArray(nested.attributes)) {
            nested.attributes = nested.attributes.filter(attr => {
              return !(
                attr &&
                typeof attr === 'object' &&
                'name' in attr &&
                (
                  !('value' in attr) ||
                  attr.value === null ||
                  (typeof attr.value === 'string' && attr.value.trim() === '')
                )
              );
            });
          }
        });
      }
    });
  }
  return section;
}

export function cleanAndReorderSubsections(section: PageTab.Section) {
  if (!section || typeof section !== 'object') return section;

  try {
    section = cleanTopLevelAttributes(section);
    section = cleanSubsectionAttributes(section);
    section = cleanStudyComponentAssociations(section);
    section = groupSubsections(section);
  } catch (err) {
    console.warn('Cleaning failed:', err);
  }
  return section;
}
