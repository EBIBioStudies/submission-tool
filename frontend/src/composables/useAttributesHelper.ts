// Map of input field names that should be transformed to standard field names
import { Ref } from 'vue';
import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';

const fieldNameTransformations: Record<string, string> = {
  organisation: 'affiliation',
  organization: 'affiliation',
};

/**
 * Transforms an input field name by checking if an equivalence has been set.
 * If no mapping is found, returns the original field name unchanged.
 *
 * @param {string} originalFieldName - The original field name (case insensitive)
 * @returns {string} - The transformed field name or the original if no match
 */
const transformFieldName = (originalFieldName: string) : string => {
  // Normalize input to lowercase to allow case-insensitive matching
  const key = originalFieldName?.toLowerCase();

  const foundReplacement = fieldNameTransformations[key];

  // Return mapped field name or original if no mapping available
  return foundReplacement ?? originalFieldName;
};

/**
 * Ensures all required types are present as attributes in the reactive attributes list.
 *
 * Iterates over the provided types array and for each type marked as 'required',
 * checks if an attribute with the same name (case-insensitive) exists in the attributesRef.
 * If missing, inserts a new attribute object with the type's name and an empty value
 * at the corresponding index in the reactive attributes array.
 */
export const addMissingAttributesGeneral = (attributesRef: Ref<PageTab.Attribute[] | undefined>, typesDefinition?: Template.Type[]) => {
  if (!attributesRef.value || !typesDefinition) return;
  for (let i = 0; i < typesDefinition.length; i++) {
    const typeDefinition = typesDefinition[i];
    // exit if not required
    if (typeDefinition?.display !== 'required') continue;

    const attrName = transformFieldName(typeDefinition.name);

    let attr = attributesRef?.value?.find(
      (f) => f?.name?.toLowerCase() === attrName?.toLowerCase(),
    );

    if (attr) continue;
    // Add missing required attribute with empty value

    attr = { name: attrName, value: '' };

    attributesRef?.value?.splice(i, 0, attr);
  }
};
