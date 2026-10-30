import { Template } from '@/models/Template.model.ts';
import { organismDefaultOptions } from '@/templates/organisms.ts';

export default {
  name: 'BioAIrepo.v1',
  title: 'BioAIrepo',
  description:
    'FAIR archival submission for biological AI models, datasets, training pipelines, and evaluation results.',
  icon: 'BioAIRepo.svg',
  DOI: true,

  onSubmission: {
    databaseName: 'BioAIRepo',
    citation: {
      authors: 'BioAIRepo Consortium',
      title:
        'BioAIRepo: FAIR archival infrastructure for biological AI models and datasets',
      journal: 'TBD',
      year: '2026',
      doi: '',
    },
  },

  sectionType: {
    name: 'Study',
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
          description:
            'Scientific summary of the AI model, dataset, and biological objective.',
        },
      },
      {
        name: 'ReleaseDate',
        title: 'Release Date',
        icon: 'fa-calendar-alt',
        display: 'required',
        controlType: {
          name: 'date',
          limitDatePast: 'P0D',
          limitDateFuture: 'P2Y',
        },
        helpContextual: {
          description:
            'The date at which your dataset should become publicly visible. This can be changed after submission if needed.',
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
    ],

    tableTypes: [
      {
        name: 'Contact',
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
            name: 'E-mail',
            display: 'required',
            controlType: { name: 'email' },
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
        name: 'Distribution',
        display: 'optional',
        fieldTypes: [
          {
            name: 'GitHub or Repository URL',
            icon: 'fa-link',
            display: 'optional',
            controlType: { name: 'link' },
          },
        ],
      },
      {
        name: 'Publication',
        description:
          'Add the bibliography relevant to the study. Autofill is available when searching by <a target="_blank" href="https://www.ncbi.nlm.nih.gov/pubmed/">PubMed</a> identifier. For other IDs, you may use <a target="_blank" href="https://www.ncbi.nlm.nih.gov/pmc/pmctopmid/#converter">PubMed\'s converter</a>.',
        icon: 'fa-book',
        uniqueCols: true,
        allowImport: false,
        rowAsSection: false,
        display: 'desirable',
        helpContextual: {},
        columnTypes: [
          {
            name: 'PMID',
            controlType: {
              name: 'pubmedid',
            },
            display: 'desirable',
          },
          {
            name: 'Authors',
            controlType: {
              name: 'text',
            },
            display: 'required',
          },
          {
            name: 'Title',
            controlType: {
              name: 'text',
            },
            display: 'required',
          },
          {
            name: 'Year',
            controlType: {
              name: 'text',
            },
            display: 'required',
          },
          {
            name: 'Volume',
            controlType: {
              name: 'text',
            },
            display: 'desirable',
          },
          {
            name: 'Issue',
            controlType: {
              name: 'text',
            },
            display: 'desirable',
          },
          {
            name: 'Type',
            controlType: {
              name: 'text',
            },
            display: 'optional',
          },
          {
            name: 'Issn',
            controlType: {
              name: 'text',
            },
            display: 'optional',
          },
          {
            name: 'DOI',
            controlType: {
              name: 'text',
            },
            display: 'optional',
          },
        ],
      },
    ],

    sectionTypes: [
      {
        name: 'Biological Context',
        display: 'required',
        icon: 'dna',
        displayAnnotations: false,

        fieldTypes: [
          {
            name: 'Biological Question',
            display: 'required',
            icon: 'question',
            controlType: { name: 'largetext', minlength: 20 },
          },
          {
            name: 'Intended Application',
            display: 'optional',
            icon: 'fa-rocket',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Organism',
            display: 'required',
            icon: 'fa-worm',
            controlType: {
              name: 'ontology',
              ontology: ['NCBITaxon'],
              defaultOptions: organismDefaultOptions,
              multiple: true,
            },
          },
          {
            name: 'Disease',
            display: 'optional',
            icon: 'fa-viruses',
            controlType: {
              name: 'ontology',
              ontology: ['MONDO'],
              multiple: true,
            },
          },
          {
            name: 'Tissue',
            display: 'optional',
            icon: 'fa-lungs',
            controlType: {
              name: 'ontology',
              ontology: ['UBERON'],
              multiple: true,
            },
          },
          {
            name: 'Cell Type',
            display: 'optional',
            icon: 'fa-circle-dot',
            controlType: {
              name: 'ontology',
              ontology: ['CL'],
              multiple: true,
            },
          },
          {
            name: 'Modality',
            display: 'optional',
            icon: 'fa-layer-group',
            helpContextual: {
              description: '',
              examples: [
                'Transcriptomics',
                'Genomics',
                'Proteomics',
                'Metabolomics',
                'Single-cell transcriptomics',
                'Spatial transcriptomics',
                'Microscopy imaging',
                'Protein structure',
                'Protein sequence',
              ],
            },
            controlType: {
              name: 'aggregate',
              field_name: 'Modality',
              section_type: 'Dataset',
              type: 'table',
            },
          },
        ],
      },

      // =========================
      // DATA (DOME)
      // =========================
      {
        name: 'Datasets',
        display: 'optional',
        displayAnnotations: false,
        icon: 'fa-database',

        fieldTypes: [
          {
            name: 'Datasets Overview',
            display: 'desirable',
            icon: 'fa-rectangle-list',
            controlType: { name: 'largetext' },
          },
        ],

        tableTypes: [
          {
            name: 'Dataset',
            display: 'required',
            icon: 'fa-table',
            rowAsSection: false,
            uniqueCols: true,

            columnTypes: [
              {
                name: 'Name',
                display: 'required',
                icon: 'fa-tag',
                controlType: { name: 'text' },
              },
              {
                name: 'Dataset',
                display: 'desirable',
                icon: 'fa-table',
                controlType: { name: 'file' },
                helpContextual: {
                  description: 'The dataset file, if you cannot provide it directly because it requires restricted access or because you already uploaded it elsewhere, please use the link instead.',
                },
              },
              {
                name: 'Link',
                display: 'desirable',
                icon: 'fa-cloud-arrow-down',

                helpContextual: {
                  examples: [
                    'https://huggingface.co/datasets/AllTheBacteria/ATB',
                  ],
                  description:
                    'Link to the dataset, either the original source URL, or an access link to the dataset. Please prefer uploading the file rather than using a link in order to ensure long term availability',
                },
                controlType: { name: 'link' },
              },
              {
                name: 'Format',
                display: 'required',
                icon: 'fa-file-excel',
                controlType: {
                  name: 'select',
                  values: [
                    'parquet',
                    'tsv',
                    'csv',
                    'h5ad',
                    'fasta',
                    'images',
                    'other',
                  ],
                },
              },
              {
                name: 'Modality',
                display: 'optional',
                icon: 'fa-layer-group',
                helpContextual: {
                  description:
                    'Specify the biological data modality that the model consumes, produces, or was trained on. This describes the nature of the biological data rather than the experimental protocol or machine learning method. Multiple modalities may be selected for multimodal models.',
                  examples: [
                    'Transcriptomics',
                    'Genomics',
                    'Proteomics',
                    'Metabolomics',
                    'Single-cell transcriptomics',
                    'Spatial transcriptomics',
                    'Microscopy imaging',
                    'Protein structure',
                    'Protein sequence',
                  ],
                },
                controlType: {
                  name: 'ontology',
                  ontology: ['EDAM'],
                  allChildrenOf: [
                    'http://edamontology.org/topic_3391', // OMICS
                    'http://edamontology.org/topic_3382', // IMAGING
                    'http://edamontology.org/topic_3070', // BIOLOGY
                  ],
                  multiple: false,
                },
              },
              {
                name: 'License',
                display: 'required',
                icon: 'fa-copyright',
                controlType: { name: 'text' },
              },
              {
                name: 'Train Split',
                icon: 'fa-dumbbell',
                display: 'optional',
                helpContextual: { description: 'Percentage of the dataset allocated to training' }, // TODO add number input and fraction input
                controlType: { name: 'text' },
              },
              {
                name: 'Validation Split',
                icon: 'fa-clipboard-check',
                display: 'optional',
                helpContextual: { description: 'Percentage of the dataset allocated to validating the hyper-parameter of the model' }, // TODO add number input and fraction input
                controlType: { name: 'text' },
              },
              {
                name: 'Test Split',
                icon: 'fa-flask',
                display: 'optional',
                helpContextual: { description: 'Percentage of the dataset allocated to test the model performance' }, // TODO add number input and fraction input
                controlType: { name: 'text' },
              },
            ],
          },
          {
            name: 'Dataset preparation',
            display: 'optional',
            icon: 'fa-microchip',
            columnTypes: [
              {
                name: 'Script',
                icon: 'fa-code',
                display: 'desirable',
                controlType: { name: 'file' },
                helpContextual: { description: 'Script to process the raw dataset into something useful' },
              },
              {
                name: 'Script link',
                icon: 'fa-link',
                display: 'optional',
                controlType: { name: 'link' },
                helpContextual: { description: 'Link to a script processing the raw dataset into something useful. Please prefer direct upload if possible' },
              },
              {
                name: 'Description',
                icon: 'fa-scroll',
                display: 'optional',
                controlType: { name: 'text' },
                helpContextual: { description: 'What does the script do to the data and how to call it' },
              },
              {
                name: 'Raw dataset',
                icon: 'fa-sitemap',
                display: 'optional',
                helpContextual: {description: 'Which dataset(s) is being prepared by this script'},
                controlType: {
                  name: 'reference',
                  field_name: 'Name',
                  section_type: 'Dataset',
                  // multiple: true // TODO enable multiple reference
                },
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
        display: 'optional',
        icon: 'fa-wrench',
        fieldTypes: [
          {
            name: 'Training Overview',
            display: 'required',
            icon: 'fa-rectangle-list',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Optimizer',
            display: 'required',
            icon: 'fa-arrows-to-circle',
            controlType: { name: 'text' },
          },
          {
            name: 'Loss Function',
            display: 'required',
            icon: 'fa-arrow-trend-down',
            controlType: { name: 'text' },
          },
          {
            name: 'Learning Rate',
            display: 'desirable',
            icon: 'fa-gauge-high',
            helpContextual: { description: 'Effective learning rate or strategy used to define it progressively. Can be a long text' },
            controlType: { name: 'text' },
          },
          {
            name: 'Batch Size',
            display: 'desirable',
            icon: 'fa-ellipsis',
            controlType: { name: 'text' },
          },
          {
            name: 'Epochs',
            display: 'desirable',
            icon: 'fa-repeat',

            controlType: { name: 'text' },
          },
          {
            name: 'Compute Hardware',
            display: 'desirable',
            icon: 'fa-microchip',
            controlType: { name: 'text' },
          },
          {
            name: 'Training Duration',
            display: 'desirable',
            icon: 'fa-hourglass-end',
            controlType: { name: 'text' },
          },
        ],
      },

      // =========================
      // MODEL (DOME)
      // =========================
      {
        name: 'Model',
        display: 'optional',
        icon: 'fa-gears',
        fieldTypes: [
          {
            name: 'Title',
            display: 'required',
            icon: 'fa-header',
            controlType: { name: 'text' },
          },
          {
            name: 'Model Overview',
            display: 'required',
            icon: 'fa-rectangle-list',
            controlType: { name: 'largetext' },
          },
          {
            name: 'License',
            display: 'required',
            icon: 'fa-copyright',
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
              description: 'License governing the model.',
            },
          },
          {
            name: 'Architecture Type',
            display: 'required',
            icon: 'fa-pen-ruler',
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
            icon: 'fa-hashtag',
            controlType: { name: 'text' },
          },
          {
            name: 'Input Description',
            display: 'required',
            icon: 'fa-right-to-bracket',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Output Description',
            display: 'required',
            icon: 'fa-right-from-bracket',
            controlType: { name: 'largetext' },
          },
          {
            name: 'Training set',
            display: 'optional',
            icon: 'fa-sitemap',
            helpContextual: { description: 'Which dataset has been used to train this model. Only provide it if you have several datasets annotated' },
            controlType: {
              name: 'reference',
              field_name: 'Name',
              section_type: 'Dataset',
            },
          },
          {
            name: 'Optimization',
            display: 'optional',
            icon: 'fa-sitemap',
            helpContextual: { description: 'Which optimization has been used to train this model. Only provide it if you have several optimization annotated' },
            controlType: {
              name: 'reference',
              field_name: 'Name',
              section_type: 'Optimization',
            },
          },
          {
            name: 'HuggingFace',
            display: 'optional',

            helpContextual: {
              description:
                'Link to the model card in hugging face if already described there',
            },
            controlType: { name: 'link' },
          },
        ],

        tableTypes: [{
          name: 'Model definition files',
          display: 'required',
          icon: 'fa-weight-hanging',
          rowAsSection: true,
          description: 'List and describe the model files needed to run your model, including weights and architecture. It is possible to link entire directories, but note that for data consumers these will be served as zip files.',
          columnTypes: [
            {
              name: 'Model file',
              controlType: { name: 'file' },
              display: 'required',
            },
            {
              name: 'Description',
              controlType: { name: 'text' },
              display: 'required',
            },
            {
              name: 'Type',
              controlType: { name: 'text' },
              display: 'desirable',
            },
          ],
        },
        ],
      },

      // =========================
      // EVALUATION (DOME)
      // =========================
      {
        name: 'Evaluation',
        display: 'optional',
        icon: 'fa-clipboard-check',

        fieldTypes: [
          {
            name: 'Evaluation Overview',
            display: 'required',
            icon: 'fa-rectangle-list',
            controlType: { name: 'largetext' },
          },
        ],

        tableTypes: [
          {
            name: 'Metrics',
            display: 'optional',
            rowAsSection: true,
            icon: 'fa-ruler-vertical',
            columnTypes: [
              {
                name: 'Metric Name',
                display: 'required',
                controlType: {
                  name: 'select',
                  values: [
                    // Classification
                    'accuracy',
                    'balanced_accuracy',
                    'f1_score',
                    'precision',
                    'recall',
                    'roc_auc',
                    'pr_auc',
                    'log_loss',
                    'mcc',
                    // Regression
                    'mae',
                    'mse',
                    'rmse',
                    'r2',
                    // Ranking
                    'ndcg',
                    'map',
                    'mrr',
                    //segmentation
                    'iou',
                    'dice',
                    //calibration
                    'brier_score',
                    'ece',
                    //embeddings
                    'ari',
                    'silhouette',
                    //bio-specific
                    'gene_expression_corr',
                    'pathway_enrichment_score',
                  ],
                },
              },
              {
                name: 'Value',
                display: 'required',
                controlType: { name: 'text' },
              },
              {
                name: 'Unit',
                display: 'optional',
                controlType: { name: 'text' },
              },
              {
                name: 'Test dataset',
                display: 'optional',
                helpContextual: { description: 'Which dataset has been used in the test to obtain this metric?' },
                controlType: {
                  name: 'reference',
                  field_name: 'Name',
                  section_type: 'Dataset',
                },
              },
              {
                name: 'Model',
                helpContextual: { description: 'Which model has been tested to obtain this metric' },
                display: 'optional',
                controlType: {
                  name: 'reference',
                  field_name: 'Name',
                  section_type: 'Model',
                },
              },
            ],
          },
          {
            name: 'Evaluation Plot',
            display: 'desirable',
            rowAsSection: true,
            icon: 'fa-chart-line',
            columnTypes: [
              {
                name: 'Figure',
                display: 'required',
                controlType: {
                  name: 'file',
                },
              },
              {
                name: 'Plot Type',
                display: 'required',
                controlType: {
                  name: 'select',
                  values: [
                    'ROC curve',
                    'Precision-recall curve',
                    'Confusion matrix',
                    'Calibration plot',
                    'Loss curve',
                    'Accuracy curve',
                    'Embedding projection',
                    'Attention map',
                    'Feature importance',
                    'Survival curve',
                    'UMAP',
                    't-SNE',
                    'Other',
                  ],
                },
              },
              {
                name: 'Description',
                display: 'desirable',
                controlType: {
                  name: 'text',
                },
              },
              {
                name: 'Test dataset',
                display: 'required',
                icon: 'fa-sitemap',
                helpContextual: { description: 'Which dataset(s) has been used to obtain this plot?' },
                controlType: {
                  name: 'reference',
                  field_name: 'Name',
                  section_type: 'Dataset',
                  // multiple: true // TODO support multiple reference
                },
              },
              {
                name: 'Model',
                display: 'required',
                icon: 'fa-sitemap',
                helpContextual: { description: 'Which model(s) has been tested to obtain this plot?' },
                controlType: {
                  name: 'reference',
                  field_name: 'Title',
                  section_type: 'Model',
                  // multiple: true // TODO support multiple reference
                },
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
        icon: 'fa-repeat',

        fieldTypes: [
          {
            name: 'Level',
            icon: 'fa-stairs',
            controlType: {
              name: 'select',
              values: [
                'Metadata only',
                'Weights available',
                'Inference reproducible',
                'Training reproducible',
                'Fully reproducible',
              ],
            },
            display: 'required',
          },
          {
            name: 'Comments',
            controlType: { name: 'largetext' },
            icon: 'fa-comment',
            display: 'optional',
          },
        ],

        sectionTypes: [
          {
            name: 'Inference requirements',
            display: 'required',
            icon: 'fa-play',

            sectionTypes: [
              {
                name: 'Hardware',
                display: 'required',
                icon: 'fa-microchip',
                fieldTypes: [
                  {
                    name: 'Execution platform',
                    display: 'required',
                    controlType: {
                      name: 'select',
                      values: ['CPU', 'GPU', 'TPU', 'NPU', 'Multi-node'],
                    },
                  },
                  {
                    name: 'Accelerator vendor',
                    display: 'optional',
                    controlType: {
                      name: 'select',
                      values: ['NVIDIA', 'AMD', 'Intel', 'Apple', 'Google'],
                    },
                  },
                  {
                    name: 'Accelerator model',
                    display: 'optional',
                    helpContextual: {
                      examples: ['NVIDIA A100', 'RTX 4090', 'MI300X'],
                    },
                    controlType: {
                      name: 'text',
                    },
                  },
                  {
                    name: 'Number of accelerators',
                    display: 'optional',
                    controlType: { name: 'number' }, // TODO implement
                  },
                  {
                    name: 'Minimum RAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Recommended RAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Minimum vRAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Recommended vRAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Disk space',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                ],
              },
              {
                name: 'Software',
                display: 'optional',
                icon: 'fa-code',
                fieldTypes: [
                  {
                    name: 'Accelerator API',
                    display: 'required',
                    controlType: {
                      name: 'select',
                      values: ['CUDA', 'ROCm', 'cuDNN', 'OpenCL'],
                    },
                  },
                  {
                    name: 'Accelerator API version',
                    display: 'optional',
                    controlType: {
                      name: 'text',
                    },
                  },
                ],
              },
            ],
          },
          {
            name: 'Training requirements',
            display: 'optional',
            icon: 'fa-wrench',

            sectionTypes: [
              {
                name: 'Hardware',
                display: 'required',
                icon: 'fa-microchip',
                fieldTypes: [
                  {
                    name: 'Execution platform',
                    display: 'required',
                    controlType: {
                      name: 'select',
                      values: ['CPU', 'GPU', 'TPU', 'NPU', 'Multi-node'],
                    },
                  },
                  {
                    name: 'Accelerator vendor',
                    display: 'optional',
                    controlType: {
                      name: 'select',
                      values: ['NVIDIA', 'AMD', 'Intel', 'Apple', 'Google'],
                    },
                  },
                  {
                    name: 'Accelerator model',
                    display: 'optional',
                    helpContextual: {
                      examples: ['NVIDIA A100', 'RTX 4090', 'MI300X'],
                    },
                    controlType: {
                      name: 'text',
                    },
                  },
                  {
                    name: 'Number of accelerators',
                    display: 'optional',
                    controlType: { name: 'number' }, // TODO implement
                  },
                  {
                    name: 'Minimum RAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Recommended RAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Minimum vRAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Recommended vRAM',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                  {
                    name: 'Disk space',
                    display: 'optional',
                    controlType: {
                      name: 'number',
                      unit: 'GB',
                    },
                  },
                ],
              },
              {
                name: 'Software',
                display: 'optional',
                icon: 'fa-code',
                fieldTypes: [
                  {
                    name: 'Accelerator API',
                    display: 'required',
                    controlType: {
                      name: 'select',
                      values: ['CUDA', 'ROCm', 'cuDNN', 'OpenCL'],
                    },
                  },
                  {
                    name: 'Accelerator API version',
                    display: 'optional',
                    controlType: {
                      name: 'text',
                    },
                  },
                ],
              },
            ],
          },
        ],

        tableTypes: [
          {
            name: 'Assets',
            display: 'optional',
            rowAsSection: true,
            icon: 'fa-boxes-stacked',

            columnTypes: [
              {
                name: 'Type',
                controlType: {
                  name: 'select',
                  createOption: true,
                  values: [
                    'Container image',
                    'Environment file',
                    'Training script',
                    'Inference script',
                    'Workflow definition',
                    'Notebook',
                  ],
                },
              },
              {
                name: 'Asset',
                icon: 'fa-box-open',
                controlType: { name: 'file' },
                display: 'required',
              },
            ],
          },
          {
            name: 'Links',
            display: 'optional',
            icon: 'fa-link',
            rowAsSection: true,

            columnTypes: [
              {
                name: 'Type',
                controlType: {
                  name: 'select',
                  createOption: true,
                  values: [
                    'Container image',
                    'Environment file',
                    'Training script',
                    'Inference script',
                    'Workflow definition',
                    'Notebook',
                  ],
                },
              },
              {
                name: 'Link',
                icon: 'fa-link',
                display: 'required',
                controlType: { name: 'link' },
              },
            ],
          },
        ],
      },
    ],
  },
} as Template.TemplateDefinition;
