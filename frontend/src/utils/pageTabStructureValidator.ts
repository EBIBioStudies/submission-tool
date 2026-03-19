interface ValidationError {
  field?: string;
  message: string;
  path?: string;
}

export const validatePageTabStructure = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push({ message: 'JSON must be an object' });
    return errors;
  }

  // Check section structure
  const validateSection = (section: any, path: string = 'root'): void => {
    if (!section || typeof section !== 'object') {
      errors.push({ message: `Section at ${path} must be an object`, path });
      return;
    }

    // Type is required
    if (!section.type || typeof section.type !== 'string') {
      errors.push({
        message: `Section at ${path} must have a 'type' property of type string`,
        path,
        field: 'type',
      });
    }

    // Validate attributes array if present
    if (section.attributes !== undefined) {
      if (!Array.isArray(section.attributes)) {
        errors.push({ message: `Attributes at ${path} must be an array`, path, field: 'attributes' });
      } else {
        section.attributes.forEach((attr: any, idx: number) => {
          if (!attr || typeof attr !== 'object') {
            errors.push({
              message: `Attribute at ${path}.attributes[${idx}] must be an object`,
              path: `${path}.attributes[${idx}]`,
            });
          } else if (!attr.name || typeof attr.name !== 'string') {
            errors.push({
              message: `Attribute at ${path}.attributes[${idx}] must have a 'name' property of type string`,
              path: `${path}.attributes[${idx}]`,
              field: 'name',
            });
          }
        });
      }
    }

    // Validate subsections if present
    if (section.subsections !== undefined) {
      if (!Array.isArray(section.subsections)) {
        errors.push({ message: `Subsections at ${path} must be an array`, path, field: 'subsections' });
      } else {
        section.subsections.forEach((subsection: any, idx: number) => {
          // Handle both Section and Section[] (nested arrays)
          if (Array.isArray(subsection)) {
            subsection.forEach((nestedSubsection: any, nestedIdx: number) => {
              const nestedType = nestedSubsection?.type || 'unknown';
              validateSection(nestedSubsection, `${path}.subsections[${idx}][${nestedIdx} - ${nestedType}]`);
            });
          } else {
            const subType = subsection?.type || 'unknown';
            validateSection(subsection, `${path}.subsections[${idx} - ${subType}]`);
          }
        });
      }
    }

    // Validate links if present
    if (section.links !== undefined) {
      if (!Array.isArray(section.links)) {
        errors.push({ message: `Links at ${path} must be an array`, path, field: 'links' });
      } else {
        section.links.forEach((link: any, idx: number) => {
          // Handle both Link and Link[] (nested arrays)
          if (Array.isArray(link)) {
            link.forEach((nestedLink: any, nestedIdx: number) => {
              const linkPath = `${path}.links[${idx}][${nestedIdx} - Link]`;
              if (!nestedLink || typeof nestedLink !== 'object') {
                errors.push({
                  message: `Link must be an object`,
                  path: linkPath,
                });
              } else if (!nestedLink.url || typeof nestedLink.url !== 'string') {
                errors.push({
                  message: `Link must have a 'url' property of type string`,
                  path: linkPath,
                  field: 'url',
                });
              }
            });
          } else {
            const linkPath = `${path}.links[${idx} - Link]`;
            if (!link || typeof link !== 'object') {
              errors.push({
                message: `Link must be an object`,
                path: linkPath,
              });
            } else if (!link.url || typeof link.url !== 'string') {
              errors.push({
                message: `Link must have a 'url' property of type string`,
                path: linkPath,
                field: 'url',
              });
            }
          }
        });
      }
    }

    // Validate files if present
    if (section.files !== undefined) {
      if (!Array.isArray(section.files)) {
        errors.push({ message: `Files at ${path} must be an array`, path, field: 'files' });
      } else {
        section.files.forEach((file: any, idx: number) => {
          // Handle both File and File[] (nested arrays)
          if (Array.isArray(file)) {
            file.forEach((nestedFile: any, nestedIdx: number) => {
              const filePath = `${path}.files[${idx}][${nestedIdx} - File]`;
              if (!nestedFile || typeof nestedFile !== 'object') {
                errors.push({
                  message: `File must be an object`,
                  path: filePath,
                });
              } else if (!nestedFile.path || typeof nestedFile.path !== 'string') {
                errors.push({
                  message: `File must have a 'path' property of type string`,
                  path: filePath,
                  field: 'path',
                });
              }
            });
          } else {
            const filePath = `${path}.files[${idx} - File]`;
            if (!file || typeof file !== 'object') {
              errors.push({
                message: `File must be an object`,
                path: filePath,
              });
            } else if (!file.path || typeof file.path !== 'string') {
              errors.push({
                message: `File must have a 'path' property of type string`,
                path: filePath,
                field: 'path',
              });
            }
          }
        });
      }
    }
  };

  // For submission type, validate the section property
  if (data.type === 'submission') {
    if (!data.section) {
      errors.push({ message: 'Submission must have a "section" property', field: 'section' });
    } else {
      validateSection(data.section, 'section');
    }
    validateSection(data, 'root');
  } else {
    validateSection(data, 'root');
  }

  return errors;
};
