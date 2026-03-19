export const prefixToLinkMap: Record<string, string> = {
  pmc: 'https://europepmc.org/articles/{0}',
  pmid: 'https://europepmc.org/abstract/MED/{0}',
  doi: 'https://dx.doi.org/{0}',
  chembl: 'https://www.ebi.ac.uk/chembldb/compound/inspect/{0}',
  ega: 'https://www.ebi.ac.uk/ega/studies/{0}',
  uniprot: 'http://www.uniprot.org/uniprot/{0}',
  ena: 'https://www.ebi.ac.uk/ena/browser/view/{0}',
  'array design': 'https://www.ebi.ac.uk/biostudies/arrayexpress/studies/{0}',
  'arrayexpress files': 'https://www.ebi.ac.uk/biostudies/arrayexpress/studies/{0}/files/',
  arrayexpress: 'https://www.ebi.ac.uk/arrayexpress/experiments/{0}',
  dbsnp: 'http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs={0}',
  pdbe: 'https://www.ebi.ac.uk/pdbe-srv/view/entry/{0}/summary',
  pfam: 'http://pfam.xfam.org/family/{0}',
  omim: 'http://omim.org/entry/{0}',
  interpro: 'https://www.ebi.ac.uk/interpro/entry/{0}',
  nucleotide: 'http://www.ncbi.nlm.nih.gov/nuccore/{0}',
  geo: 'http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={0}',
  intact: 'https://www.ebi.ac.uk/intact/interaction/{0}',
  biostudies: 'https://www.ebi.ac.uk/biostudies/studies/{0}',
  'biostudies title': 'https://www.ebi.ac.uk/biostudies/studies?first&query=title%3A%22{0}%22',
  'biostudies search': 'https://www.ebi.ac.uk/biostudies/studies?query={0}',
  go: 'http://amigo.geneontology.org/amigo/term/{0}',
  chebi: 'https://www.ebi.ac.uk/chebi/searchId.do?chebiId={0}',
  bioproject: 'https://www.ncbi.nlm.nih.gov/bioproject/{0}',
  biosamples: 'https://www.ebi.ac.uk/biosamples/samples/{0}',
  chemagora: 'http://chemagora.jrc.ec.europa.eu/chemagora/inchikey/{0}',
  compound: 'https://www.ebi.ac.uk/biostudies/studies/{0}',
  rfam: 'http://rfam.org/family/{0}',
  rnacentral: 'http://rnacentral.org/rna/{0}',
  nct: 'https://clinicaltrials.gov/ct2/show/{0}',
  'expression atlas': 'https://www.ebi.ac.uk/gxa/experiments/{0}?ref=biostudies',
  'expression atlas (single cell)': 'https://www.ebi.ac.uk/gxa/sc/experiments/{0}?ref=biostudies',
  idr: 'https://idr.openmicroscopy.org/search/?query=Name:{0}',
  empiar: 'https://www.ebi.ac.uk/pdbe/emdb/empiar/entry/{0}/'
};

export const linkNameSpaceList = ['genedb', 'refseq.gcf', 'bgee.stage', 'maxo', 'signaling-gateway', 'bgee.organ',
    'ncbidrs', 'miriam.collection', 'eco', 'tricdb', 'macie', 'maggot', 'neuromorpho', 'hco', 'glycomedb', 'dg.4825',
    'vectorbase', '3dmet', 'dragondb.allele', 'vbase2'];

export const SearchLinks = (filterQuery: string)=>{
  const combinedList = Object.keys(prefixToLinkMap).concat(linkNameSpaceList);
  // Sort the combined array alphabetically
  combinedList.sort((a, b) => a.localeCompare(b));
  let filteredCombinedList = combinedList;
  if(filterQuery)
    filteredCombinedList = combinedList.filter(item => filterQuery === '' || item.includes(filterQuery));

  return filteredCombinedList;
};
