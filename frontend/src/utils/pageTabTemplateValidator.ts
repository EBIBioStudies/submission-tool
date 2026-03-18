import { Template } from '@/models/Template.model.ts';

interface ValidationError {
  field?: string;
  message: string;
  path?: string;
}

export const validateAgainstTemplate = (data: any, template: Template.TemplateDefinition): ValidationError[] => {
  const errors: ValidationError[] = [];
  const accnoMap = new Set<string>();

  // Collect all accnos in the data structure
  const collectAccnos = (section: any): void => {
    if (section?.accno) {
      accnoMap.add(section.accno);
    }

    // Collect from subsections
    if (section?.subsections && Array.isArray(section.subsections)) {
      section.subsections.forEach((subsection: any) => {
        if (Array.isArray(subsection)) {
          subsection.forEach((nested: any) => collectAccnos(nested));
        } else {
          collectAccnos(subsection);
        }
      });
    }

    // Collect from links
    if (section?.links && Array.isArray(section.links)) {
      section.links.forEach((link: any) => {
        if (Array.isArray(link)) {
          link.forEach((nested: any) => {
            if (nested?.accno) accnoMap.add(nested.accno);
          });
        } else if (link?.accno) {
          accnoMap.add(link.accno);
        }
      });
    }

    // Collect from files
    if (section?.files && Array.isArray(section.files)) {
      section.files.forEach((file: any) => {
        if (Array.isArray(file)) {
          file.forEach((nested: any) => {
            if (nested?.accno) accnoMap.add(nested.accno);
          });
        } else if (file?.accno) {
          accnoMap.add(file.accno);
        }
      });
    }
  };

  // Collect all accnos first
  const rootSection = data.type === 'submission' ? data.section : data;
  if (data.accno) accnoMap.add(data.accno);
  collectAccnos(rootSection);

  const getSectionType = (
    template: Template.SectionType | Template.TableType,
    typeName: string
  ): Template.SectionType | Template.TableType | undefined => {
    // Check in sectionTypes
    const sectionType = template.sectionTypes?.find((s) => s.name === typeName);
    if (sectionType) return sectionType;

    // Check in tableTypes
    return template.tableTypes?.find((t) => t.name === typeName);
  };

  const validateAttributes = (
    attributes: any[],
    fields: Template.FieldType[] | Template.ColumnType[] | undefined,
    path: string,
    allowNewAttribute: boolean
  ) => {
    const requiredFields = fields?.filter((f) => f.display === 'required') || [];
    const fieldNames = new Set(fields?.map((f) => f.name) || []);
    const providedFields = new Set<string>();

    attributes.forEach(attr => {
      const attrName = attr.name;
      providedFields.add(attrName);
      const attrPath = `${path}.attributes[${attrName}]`;

      // Check if custom attributes are allowed
      if (!fieldNames.has(attrName) && !allowNewAttribute) {
        errors.push({
          message: `Custom attribute "${attrName}" is not allowed in this template`,
          path: attrPath,
          field: attrName,
        });
      }

      // Check if this is a reference attribute
      if (attr.reference === true) {
        const referencedAccno = attr.value;
        if (!referencedAccno) {
          errors.push({
            message: `Reference attribute "${attrName}" must have a value (accno to reference)`,
            path: attrPath,
            field: attrName,
          });
        } else if (!accnoMap.has(referencedAccno)) {
          errors.push({
            message: `Reference attribute "${attrName}" references non-existent accno "${referencedAccno}"`,
            path: attrPath,
            field: attrName,
          });
        }
      }
    });

    // Check for missing required fields
    requiredFields.forEach((field) => {
      if (!providedFields.has(field.name)) {
        errors.push({
          message: `Required field "${field.name}" is missing`,
          path: `${path}.attributes`,
          field: field.name,
        });
      }
    });
  };

  const validateSection = (
    section: any,
    sectionTemplate: Template.SectionType | Template.TableType,
    path: string,
    inheritedAllowNewAttribute?: boolean
  ): void => {
    // Determine if new attributes are allowed (inherit from parent if not explicitly set)
    const allowNewAttribute = sectionTemplate.allowNewAttribute ?? inheritedAllowNewAttribute ?? false;

    // Validate attributes
    if (section.attributes) {
      const fields = [
        ...(sectionTemplate.fieldTypes || []),
        ...((sectionTemplate as Template.TableType).columnTypes || []),
      ];
      validateAttributes(section.attributes, fields, path, allowNewAttribute);
    }

    // Validate subsections
    if (section.subsections && Array.isArray(section.subsections)) {
      section.subsections.forEach((subsection: any, idx: number) => {
        // Handle both Section and Section[] (nested arrays)
        if (Array.isArray(subsection)) {
          subsection.forEach((nestedSubsection: any, nestedIdx: number) => {
            const subsectionType = getSectionType(sectionTemplate, nestedSubsection.type);
            const subsectionPath = `${path}.subsections[${idx}][${nestedIdx} - ${nestedSubsection.type}]`;
            if (!subsectionType && sectionTemplate.disableCustomSubsection) {
              errors.push({
                message: `Custom subsection type "${nestedSubsection.type}" is not allowed in this template`,
                path: subsectionPath,
              });
            } else if (subsectionType) {
              validateSection(nestedSubsection, subsectionType, subsectionPath, allowNewAttribute);
            }
          });
        } else {
          const subsectionType = getSectionType(sectionTemplate, subsection.type);
          const subsectionPath = `${path}.subsections[${idx} - ${subsection.type}]`;
          if (!subsectionType && sectionTemplate.disableCustomSubsection) {
            errors.push({
              message: `Custom subsection type "${subsection.type}" is not allowed in this template`,
              path: subsectionPath,
            });
          } else if (subsectionType) {
            validateSection(subsection, subsectionType, subsectionPath, allowNewAttribute);
          }
        }
      });
    }

    // Validate tables (links and files)
    if (section.links && Array.isArray(section.links)) {
      const linkTableType = sectionTemplate.tableTypes?.find((t) => t.name === 'Link');
      if (!linkTableType && sectionTemplate.disableCustomTable) {
        errors.push({
          message: 'Links are not allowed in this template',
          path: `${path}.links`,
        });
      }
    }

    if (section.files && Array.isArray(section.files)) {
      const fileTableType = sectionTemplate.tableTypes?.find((t) => t.name === 'File');
      if (!fileTableType && sectionTemplate.disableCustomTable) {
        errors.push({
          message: 'Files are not allowed in this template',
          path: `${path}.files`,
        });
      }
    }
  };

  // Start validation from root or section
  const startPath = data.type === 'submission' ? 'submission.section' : 'submission';
  validateSection(rootSection, template.sectionType, startPath);

  return errors;
};
