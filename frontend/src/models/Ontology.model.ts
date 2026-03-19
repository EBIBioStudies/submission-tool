import axios from 'axios';
import qs from 'qs';


export namespace Ontology {
  export namespace OLS4 {
    export const URL = 'https://www.ebi.ac.uk/ols4/api/v2/entities';
    export type Query = {
      search: string,
      size?: number, // default 20
      ontologyId?: string[]
      page?: number,
      lang?: string, // default en
      facetFields?: string,
      searchFields?: string,
      boostFields?: string,
      exactMatch?: boolean,
      includeObsoleteEntities?: boolean,
      isDefiningOntology?: boolean,
      type?: Ontology.OLS3.Type,
      hierarchicalAncestor?: string[], // iri array, e.g. http://purl.obolibrary.org/obo/UBERON_0002365, http://purl.obolibrary.org/obo/UBERON_0002530
    }
    export type Results = {
      elements: Entity[],
      facetFieldsToCounts: { [facetField: string]: number }
      numElements: number,
      page: number,
      totalElements: number,
      totalPages: number,
    }

    export type Entity = {
      appearsIn: string[]; // ["dhba", "pride", "cpont", "bao", "aism", "efo", "clo", "obib", "mondo", "txpo", "hra", "fovt", "pcl",…]
      curie: string; // "UBERON:0002107"
      definedBy: string[]; // ["uberon"]
      definition: Value[];
      definitionProperty: string; // "http://purl.obolibrary.org/obo/IAO_0000115"
      directAncestor: Value[] // ["http://purl.obolibrary.org/obo/UBERON_0002365", "http://purl.obolibrary.org/obo/UBERON_0002530",…]
      directParent: Value[]
      hasDirectChildren: boolean
      hasDirectParents: boolean
      hierarchicalAncestor: Value[]
      hierarchicalParent: Value[]
      hierarchicalProperty: string // "http://www.w3.org/2000/01/rdf-schema#subClassOf"
      imported: boolean
      iri: string // "http://purl.obolibrary.org/obo/UBERON_0002107"
      isDefiningOntology: boolean
      isObsolete: boolean
      isPreferredRoot: boolean
      label: string[]
      linkedEntities: {
        [termId: string]: { // AAO:0000139
          curie: string, // "AAO:0000139"
          source: string, // "https://raw.githubusercontent.com/biopragmatics/bioregistry/main/exports/registry/registry.json"
          url: string // "http://purl.obolibrary.org/obo/AAO_0000139"
        }
      }
      linksTo: string[]
      numDescendants: number
      numHierarchicalDescendants: number
      ontologyId: string
      ontologyIri: string // "http://purl.obolibrary.org/obo/uberon.owl"
      ontologyPreferredPrefix: string //"UBERON"
      relatedTo: Related[]
      searchableAnnotationValues: boolean[]
      shortForm: string // "UBERON_0002107"
      synonym: Value[]
      synonymProperty: string // "http://www.geneontology.org/formats/oboInOwl#hasRelatedSynonym"
      type: string[] // ["class", "entity"]
    } & { [key: string]: any } // http://purl.obolibrary.org/obo/UBPROP_0000001: {type: ["reification"],…}

    export type ComplexValue = {
      type?: string[], // ["reification"]
      value: string, // "An exocrine gland which secretes bile and functions in metabolism of protein and carbohydrate and fat, synthesizes substances involved in the clotting of the blood, synthesizes vitamin A, detoxifies poisonous substances, stores glycogen, and breaks down worn-out erythrocytes[GO]."
      axioms: { [oboRef: string]: string[] } // {http://www.geneontology.org/formats/oboInOwl#hasDbXref: ["BTO:0000759", "Wikipedia:Liver"]}
    };
    export type Value = string | ComplexValue

    export type Related = {
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': string //  "http://www.w3.org/2002/07/owl#Restriction"
      'http://www.w3.org/2002/07/owl#onProperty': string //   "http://purl.obolibrary.org/obo/RO_0003000"
      'http://www.w3.org/2002/07/owl#someValuesFrom': string //   "http://purl.obolibrary.org/obo/UBERON_0001970"
      isObsolete: boolean
      property: string // 'http://purl.obolibrary.org/obo/RO_0003000'
      type: string[] // ['related']
      value: string //'http://purl.obolibrary.org/obo/UBERON_0001970'
    }

    export function isComplexValue(value: Value): value is ComplexValue {
      return typeof value === 'object' && value !== null;
    }

    export function extractValue(value: Value): string {
      return isComplexValue(value) ? value.value : value;
    }

    export const search = async (query: Query) => {
      return axios.get<Results>(`${URL}`, {
        params: {
          ...query,
          type: ['class'],
        },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'comma' }),
      }).then(res => res.data);
    };

  }


  export namespace OLS3 {
    export const URL = 'https://www.ebi.ac.uk/ols4/api/search';

    export type Type = 'class' | 'property' | 'individual' | 'ontology';
    export type Query<FIELDS extends Field[] = ['iri', 'label', 'short_form', 'obo_id', 'ontology_name', 'ontology_prefix', 'description', 'type', 'exact_synonyms', 'related_synonyms', 'narrow_synonyms', 'broad_synonyms']> = {
      q: string,
      start?: number, // default 0
      rows?: number, // default 10
      ontology?: string[] // efo,bfo
      type?: (Type)[],
      slim?: string[]
      /**
       * Specify the fields to return
       */
      fieldList?: FIELDS // iri,label,short_form,obo_id,ontology_name,ontology_prefix,description,type,exact_synonyms,related_synonyms,narrow_synonyms,broad_synonyms
      /**
       * Specify the fields to query
       */
      queryFields?: Field[]  //label, synonym, description, short_form, obo_id, annotations, logical_description, iri

      exact?: boolean
      obsoletes?: boolean,
      local?: boolean,
      isLeaf?: boolean
      inclusive?: boolean

      childrenOf?: string[] // http://www.ebi.ac.uk/efo/EFO_0001421, http://www.ebi.ac.uk/efo/EFO_0004228
      allChildrenOf?: string[] // http://www.ebi.ac.uk/efo/EFO_0001421, http://www.ebi.ac.uk/efo/EFO_0004228
    }

    export type Results<Doc> = {
      response: {
        docs: Doc[],
        numFound: number,
        start: number,
      },
      facet_counts: { facetFields: { [facetField: string]: string[] } }
    }

    export type Document = {
      iri: string // "http://purl.obolibrary.org/obo/MI_0581",
      ontology_name: string // "mi"
      ontology_prefix: string // "MI"
      short_form: string // "MI_0581"
      description: string[] // ["A gene whose genetic perturbation suppresses the phenotype resulting from a different genetic perturbation."]
      logical_description: string[]
      annotations: string[]
      label: string // "suppressor gene"
      obo_id: string // "MI:0581",
      type: Type,
      exact_synonyms: string[]
      narrow_synonyms: string[]
      related_synonyms: string[]
      broad_synonyms: string[]
      synonym: string[]
    }

    type Field = keyof Document

    export type DefinedDocument<Fs extends Field[]> = Partial<Pick<Document, Fs[number]>>

    export const search = async <FIELDS extends Field[] = ['iri', 'label', 'short_form', 'obo_id', 'ontology_name', 'ontology_prefix', 'description', 'type', 'exact_synonyms', 'related_synonyms', 'narrow_synonyms', 'broad_synonyms']>
    (query: Query<FIELDS>) => {
      return axios.get<Results<DefinedDocument<FIELDS>>>(`${URL}`, {
        params: query,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'comma' }),
      }).then(res => res.data.response.docs);
    };

  }
}
