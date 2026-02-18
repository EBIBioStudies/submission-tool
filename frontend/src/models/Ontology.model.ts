export namespace Ontology {
  export const URL = 'https://www.ebi.ac.uk/ols4/api/v2/entities';
  export type Query = {
    search: string,
    size?: number, // default 20
    ontologyId?: string
    page?: number,
    lang?: string, // default en
    facetFields?: string,
    exactMatch?: boolean,
    includeObsoleteEntities?: boolean,
    isDefiningOntology?: boolean,
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
}
