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
    | 'ontology'
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

    /**
     * The OLS ontology id to search into if the control type is ontology
     */
    ontology?: string[];
    /**
     * Whether to include obsolete terms in ontology search
     */
    obsoletes?: boolean,
    /**
     * Set to true to only return terms that are in a defining ontology e.g. Only return matches to gene ontology terms in the gene ontology, and exclude ontologies where those terms are also referenced
     */
    local?: boolean,
    /**
     * Set to true to only accept leaf terms (exclude all intermediary nodes)
     */
    isLeaf?: boolean
    /**
     * Set to true to only accept exact matching terms
     */
    exact?: boolean
    /**
     * If true, an empty ontology search is translated to "*" to see all options with pagination when no text is precised
     */
    defaultAll?: boolean;
    /**
     * Root term IRIs of the query. Any terms not having one of these roots in their ancestry will be discarded.
     * @example ["http://purl.obolibrary.org/obo/UBERON_0002365", "http://purl.obolibrary.org/obo/UBERON_0002530"]
     */
    allChildrenOf?: string[];
    /**
     * Size of the page to query
     */
    pageSize?: number;



    /**
     * On single `select` controls, whether to show a "create new" option at the top of the list.
     */
    createOption?: boolean;
    allowPast?: boolean;
    allowFolders?: boolean;
    /**
     * On `select` controls, whether to allow adding new values
     */
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
    /**
     * used to override readonly mode, e.g. on ArrayExpress, release date and publication should still be editable despite being readonly
     */
    overrideReadonly?: boolean;
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

  export interface AnnotationType extends TableType {
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

    /**
     * Whether to allow renaming the type of the section (which is displayed as label). This is inherited to subsections
     */
    allowRename? : boolean;
  }

  export interface RootSectionType extends SectionType {
    banner?: {
      src: string,
      alt?: string,
      backgroundColor?: string,
      contactUs?: { text: string }
    };
  }

  export interface TemplateDefinition {
    name: string;
    sectionType: RootSectionType;
    display?: DisplayType

    title?: string;
    description?: string;
    helpText?: string;
    helpLink?: string;
    displayName?: string

    DOI?: boolean;
  }

  export function isValueObject(val: string | Template.ValueObject): val is Template.ValueObject {
    return typeof val === 'object' && 'value' in val;
  }
}


