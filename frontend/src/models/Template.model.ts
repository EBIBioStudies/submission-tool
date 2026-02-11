import { PageTab } from '@/models/PageTab.model.ts';

export namespace Template {
  export type DisplayType = 'required' | 'desirable' | 'optional' | 'readonly';


  export type ControlTypeName =
    'text'
    | 'largetext'
    | 'select'
    | 'idlink'
    | 'pubmedid'
    | 'reference'
    | 'filelist'
    | 'file'
    | 'orcid'
    | 'org'
    | 'date'
    | string


  export interface HelpContextual {
    description?: string;
    examples?: string[];
    examplesHtml?: string[];
  }

  export type ValueObject = {
    value: string;
    valqual?: PageTab.Tag[];
  }

  export interface ControlType {
    name: ControlTypeName;
    placeholder?: string;

    values?: (string | ValueObject)[];
    defaultValue?: string;
    field_name?: string;
    section_type?: string;
    type?: 'section' | 'table';

    minlength?: number;

    createOption?: boolean;
    allowPast?: boolean;
    allowFolders?: boolean;
    enableValueAdd?: boolean;
    multiple?: boolean;
  }


  export interface Type {
    display?: DisplayType;
    controlType?: ControlType;
    helpContextual?: HelpContextual;

    name: string;
    title?: string;
    icon?: string;
    description?: string;
    helpText?: string;
    helpLink?: string;

    uniqueValues?: boolean;
    createdOnRender?: boolean;
  }

  export interface AnnotationType extends Type {
    columnTypes: ColumnType[];

    singleRow?: boolean;
    allowImport?: boolean;
  }

  export interface FieldType extends Type {
    asyncValueValidatorName?: 'forFileList' | 'forStudyTitle';
  }

  export interface ColumnType extends Type {
    required?: boolean;
    autosuggest?: boolean;
    dependency?: {
      column_name: string,
      table_name: string,
      type: string,
    },
  }

  export interface TableType extends SectionType {
    columnTypes?: ColumnType[];

    uniqueCols?: boolean;
    rowAsSection?: boolean;
    allowImport?: boolean;
    allowCustomCols?: boolean;
    displayAnnotations?: boolean;
    hideColumns?: boolean;
  }

  export interface SectionType extends Type {
    name: string;
    fieldTypes?: FieldType[];
    tableTypes?: TableType[];
    sectionTypes?: SectionType[];

    annotationsType?: AnnotationType;
    tableGroups?: string[][];
    minRequired?: number;
    sectionExample?: string;

    displayAnnotations?: boolean;
    rowAsSection?: boolean;
    singleRow?: boolean;
    allowImport?: boolean;
    /**
     * Whether to allow adding new attributes to the section. This is inherited to subsections
     */
    allowNewAttribute? : boolean;
    /**
     * Whether to allow adding custom subsections. This is inherited to subsections
     */
    disableCustomSubsection?: boolean;
    /**
     * Whether to allow adding custom table. This is inherited to subsections
     */
    disableCustomTable?: boolean;
  }

  export interface RootSectionType extends SectionType {
    banner?: { src: string, alt?: string, backgroundColor?: string, contactUs?: { text: string } };
  }

  export interface TemplateDefinition extends SectionType {
    name: string;
    sectionType: RootSectionType;

    displayName?: string

    DOI?: boolean;
  }

  export function isValueObject(val: string | Template.ValueObject): val is Template.ValueObject {
    return typeof val === 'object' && 'value' in val;
  }
}


