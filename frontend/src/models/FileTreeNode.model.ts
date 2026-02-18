export interface Node {
  name: string;
  path: string;
  type: 'dir' | 'file';
  expanded?: boolean;
  selectedPath?: string;
  children?: Node[];
}
