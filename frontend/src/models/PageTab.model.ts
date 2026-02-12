export namespace PageTab {

  export interface Tag {
    name: string;
    value?: string;
  }

  export interface DetailedAttribute extends Tag {
    nmqual?: Tag[];
    valqual?: Tag[];
  }

  export interface ReferenceAttribute extends Tag {
    reference?: true;
  }

  export type Attribute =
    DetailedAttribute
    & ReferenceAttribute
    & Tag

  export interface File {
    path: string;
    attributes?: Attribute[];
    size?: number;
    type?: 'file' | 'File';

  }


  export interface Link {
    url: string;
    attributes?: Attribute[];
    type?: 'link' | 'Link';
  }

  export interface Section {
    accno?: string;
    type: string;
    attributes?: Attribute[];
    subsections?: (Section | Section[])[];
    links?: Link[];
    files?: File[];

    label?: string;
    name?: string;
  }

  export interface Submission extends Section {
    accno: string;
    type: 'submission';
    attributes: Attribute[];
    section: Section;
  }

  export type LocalSubmission = Submission & {
    displayKey: string;
    newSubmission: boolean;
  }

  export type BuildingSection = Partial<Section>
    & Partial<Omit<File, 'type'>>
    & Partial<Omit<Link, 'type'>>
    & Partial<DetailedAttribute>
    & Partial<ReferenceAttribute>
    & { type: string };

  export type IndexedTag = PageTab.Tag & { index: number }
  export type Organisation = PageTab.Section & { authorIndex: number, value: string };

  // export namespace Extended {
  //   export interface Tag {
  //     name: string;
  //     value: string;
  //   }
  //
  //   export interface AttributeDetail {
  //     name: string,
  //     value?: string,
  //   }
  //
  //   export interface Attribute {
  //     name: string,
  //     value?: string,
  //     reference?: boolean,
  //     nameAttrs?: AttributeDetail[],
  //     valueAttrs?: AttributeDetail[],
  //   }
  //
  //   export interface File {
  //     filePath: string;
  //     fileName: string;
  //     attributes?: Attribute[];
  //   }
  //
  //   export enum FileType {
  //     FILE = 'file',
  //     DIRECTORY = 'directory'
  //   }
  //
  //   export interface PersistedFile extends File {
  //     relPath: string;
  //     md5: string;
  //     size: number;
  //     type: FileType;
  //   }
  //
  //   export interface RequestFile extends File {
  //     filePath: string;
  //
  //   }
  //
  //   export interface Link {
  //     url: string;
  //     attributes?: Attribute[];
  //   }
  //
  //   export interface Submission extends PageTab.Submission {
  //     version: number,
  //     /**
  //      * email address
  //      */
  //     owner: string,
  //     /**
  //      * email address
  //      */
  //     submitter: string,
  //     title: string,
  //     method: 'FILE' // todo,
  //     relPath: string,
  //     rootPath: string,
  //     released: boolean,
  //     secretKey: string,
  //     releaseTime: TDateISODate,
  //     modificationTime: TDateISODate,
  //     creationTime: TDateISODate,
  //   }
  //
  // }

}




