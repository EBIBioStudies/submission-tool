import { Template } from '@/models/Template.model.ts';

export default {
  name: 'BioAIrepo.v1',
  title: 'BioAIrepo',
  description: 'FAIR archival submission for biological AI models, datasets, training pipelines, and evaluation results.',
  icon: 'BioAIRepo.svg',
  DOI: true,

  onSubmission: {
    databaseName: 'BioAIRepo',
    citation: {
      authors: 'BioAIRepo Consortium',
      title: 'BioAIRepo: FAIR archival infrastructure for biological AI models and datasets',
      journal: 'TBD',
      year: '2026',
      doi: '',
    },
  },

  sectionType: {
    name: 'Submission',
    display: 'required',
    allowNewAttribute: false,
    disableCustomSubsection: true,
    disableCustomTable: true,
    displayAnnotations: false,

    fieldTypes: [
      {
        name: 'Title',
        icon: 'fa-heading',
        display: 'required',
        controlType: { name: 'largetext', minlength: 10 },
        helpContextual: {
          description: 'Title of the BioAI submission.',
        },
      },
      {
        name: 'Description',
        icon: 'fa-comment',
        display: 'required',
        controlType: { name: 'largetext' },
        helpContextual: {
          description: 'Scientific summary of the AI model, dataset, and biological objective.',
        },
      },
      {
        name: 'Keywords',
        icon: 'fa-tags',
        display: 'required',
        controlType: {
          name: 'select',
          multiple: true,
          enableValueAdd: true,
        },
        helpContextual: {
          description: 'Search keywords for biological AI retrieval.',
        },
      },
      {
        name: 'License',
        display: 'required',
        controlType: {
          name: 'select',
          values: [
            { value: 'CC0' },
            { value: 'CC BY 4.0' },
            { value: 'Apache-2.0' },
            { value: 'MIT' },
          ],
        },
        helpContextual: {
          description: 'License governing datasets and/or models.',
        },
      },
    ],

    tableTypes: [
      {
        name: 'Authors',
        display: 'required',
        rowAsSection: true,
        uniqueCols: true,
        columnTypes: [
          {
            name: 'Name',
            display: 'required',
            controlType: { name: 'text' },
          },
          {
            name: 'ORCID',
            display: 'desirable',
            controlType: { name: 'orcid' },
          },
          {
            name: 'Organisation',
            display: 'required',
            controlType: { name: 'org' },
          },
          {
            name: 'Role',
            display: 'desirable',
            controlType: {
              name: 'select',
              enableValueAdd: true,
              values: [
                'PI',
                'data scientist',
                'ML engineer',
                'biologist',
                'annotator',
                'software engineer',
              ],
            },
          },
        ],
      },

      {
        name: 'Publication',
        display: 'desirable',
        rowAsSection: true,
        columnTypes: [
          {
            name: 'DOI',
            controlType: { name: 'text' },
          },
          {
            name: 'PubMed ID',
            controlType: { name: 'pubmedid' },
          },
          {
            name: 'Title',
            controlType: { name: 'text' },
          },
        ],
      },

      {
        name: 'External Links',
        display: 'desirable',
        rowAsSection: true,
        columnTypes: [
          {
            name: 'GitHub',
            controlType: { name: 'idlink' },
          },
          {
            name: 'HuggingFace Dataset',
            controlType: { name: 'idlink' },
          },
          {
            name: 'HuggingFace Model',
            controlType: { name: 'idlink' },
          },
        ],
      },
    ],

    sectionTypes: [
      {
        name: 'Biological Context',
        display: 'required',
        displayAnnotations: false,

        fieldTypes: [
          {
            name: 'Biological Question',
            display: 'required',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Intended Application',
            display: 'required',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Organism',
            display: 'required',
            controlType: {
              name: 'ontology',
              ontology: ['NCBITaxon'],
            },
          },
          {
            name: 'Disease',
            display: 'optional',
            controlType: {
              name: 'ontology',
              ontology: ['MONDO', 'DOID'],
            },
          },
          {
            name: 'Tissue',
            display: 'optional',
            controlType: {
              name: 'ontology',
              ontology: ['UBERON'],
            },
          },
          {
            name: 'Cell Type',
            display: 'optional',
            controlType: {
              name: 'ontology',
              ontology: ['CL'],
            },
          },
          {
            name: 'Modality',
            display: 'required',
            controlType: {
              name: 'ontology',
              ontology: ['EDAM'],
            },
          },
        ],
      },

      // =========================
      // DATA (DOME)
      // =========================
      {
        name: 'Datasets',
        display: 'required',
        displayAnnotations: false,

        fieldTypes: [
          {
            name: 'Dataset Overview',
            display: 'required',
            controlType: { name: 'largetext' },
          },
        ],

        tableTypes: [
          {
            name: 'Dataset',
            display: 'required',
            rowAsSection: true,
            uniqueCols: true,

            columnTypes: [
              {
                name: 'Name',
                display: 'required',
                controlType: { name: 'text' },
              },
              {
                name: 'Source',
                display: 'desirable',
                controlType: {
                  name: 'select',
                  values: [
                    'BioStudies',
                    'HuggingFace',
                    'GEO',
                    'PRIDE',
                    'ENA',
                    'PDB',
                    'Custom',
                  ],
                },
              },
              {
                name: 'Artifact',
                display: 'required',
                controlType: { name: 'file' },
              },
              {
                name: 'Format',
                display: 'required',
                controlType: {
                  name: 'select',
                  values: ['parquet', 'tsv', 'csv', 'h5ad', 'fasta', 'images', 'other'],
                },
              },
              {
                name: 'License',
                display: 'required',
                controlType: { name: 'text' },
              },
              {
                name: 'Train Split',
                display: 'optional',
                controlType: { name: 'text' },
              },
              {
                name: 'Validation Split',
                display: 'optional',
                controlType: { name: 'text' },
              },
              {
                name: 'Test Split',
                display: 'optional',
                controlType: { name: 'text' },
              },
            ],
          },
        ],
      },

      // =========================
      // OPTIMIZATION (DOME)
      // =========================
      {
        name: 'Optimization',
        display: 'required',

        fieldTypes: [
          {
            name: 'Training Overview',
            display: 'required',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Optimizer',
            display: 'required',
            controlType: { name: 'text' },
          },
          {
            name: 'Loss Function',
            display: 'required',
            controlType: { name: 'text' },
          },
          {
            name: 'Learning Rate',
            display: 'desirable',
            controlType: { name: 'text' },
          },
          {
            name: 'Batch Size',
            display: 'desirable',
            controlType: { name: 'text' },
          },
          {
            name: 'Epochs',
            display: 'desirable',
            controlType: { name: 'text' },
          },
          {
            name: 'Compute Hardware',
            display: 'desirable',
            controlType: { name: 'text' },
          },
          {
            name: 'Training Duration',
            display: 'desirable',
            controlType: { name: 'text' },
          },
        ],
      },

      // =========================
      // MODEL (DOME)
      // =========================
      {
        name: 'Model',
        display: 'required',

        fieldTypes: [
          {
            name: 'Model Overview',
            display: 'required',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Architecture Type',
            display: 'required',
            controlType: {
              name: 'select',
              values: [
                'Transformer',
                'CNN',
                'GNN',
                'Diffusion',
                'RNN',
                'Hybrid',
              ],
            },
          },
          {
            name: 'Parameters Count',
            display: 'desirable',
            controlType: { name: 'text' },
          },
          {
            name: 'Input Description',
            display: 'required',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Output Description',
            display: 'required',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Weights',
            display: 'required',
            controlType: { name: 'filelist' },
          },
        ],
      },

      // =========================
      // EVALUATION (DOME)
      // =========================
      {
        name: 'Evaluation',
        display: 'required',

        fieldTypes: [
          {
            name: 'Evaluation Overview',
            display: 'required',
            controlType: { name: 'largetext' },
          },
        ],

        tableTypes: [
          {
            name: 'Metrics',
            display: 'required',
            rowAsSection: true,
            columnTypes: [
              {
                name: 'Metric Name',
                controlType: { name: 'text' },
              },
              {
                name: 'Value',
                controlType: { name: 'text' },
              },
              {
                name: 'Dataset',
                controlType: { name: 'text' },
              },
            ],
          },
        ],
      },

      // =========================
      // REPRODUCIBILITY
      // =========================
      {
        name: 'Reproducibility',
        display: 'desirable',

        fieldTypes: [
          {
            name: 'Container Image',
            controlType: { name: 'idlink' },
          },
          {
            name: 'Environment',
            controlType: { name: 'filelist' },
          },
          {
            name: 'Workflow Definition',
            controlType: { name: 'filelist' },
          },
        ],
      },
    ],
  },
} as Template.TemplateDefinition;
