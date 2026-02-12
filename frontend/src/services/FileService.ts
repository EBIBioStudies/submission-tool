import axios, { AxiosProgressEvent } from 'axios';
import utils from '@/utils.ts';
import { Ref } from 'vue';
import AuthService from '@/services/AuthService.ts';

//TODO: Get these constants from config
const HARD_UPLOAD_SIZE_LIMIT = 30; // in GBs;
const MAX_UPLOAD_SIZE = 1024; // in MBs;
const MAX_UPLOAD_FILE_COUNT = 1000;
const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
}


export interface ValidationResult {
  valid: boolean;
  message?: string | null;
}

export interface UploadProgress {
  name: string;
  progress: number;
}

export namespace FileService {
  export const fetchFiles = async (path: string[], loading?: Ref<boolean>): Promise<FileItem[]> => {
    let files = [] as FileItem[]
    if (!AuthService.isAuthenticated()) return files;

    if (loading) loading.value = true;
    const fetchAbortController = new AbortController();

    try {
      const response = await axios.post<FileItem[]>(
        '/api/files/user/query',
        { path: path.join('/') },
        { signal: fetchAbortController.signal },
      );

      files = response.data.map(file => ({
        ...file,
        path: file.path === 'user' ? '' : file.path.replace(/^user\/?/, ''),
      }))
    } catch (error: any) {
      // Ignore abort errors - these are intentional cancellations
      if (error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
        if (loading) loading.value = false;
        return files;
      }
      console.error('Failed to fetch files:', error);
    } finally {
      if (loading) loading.value = false;
    }

    return files;
  };

  export const downloadFile = (file: FileItem) => {
    axios.post('/api/files/user/download', {
      path: file.path,
      fileName: file.name,
    }, {
      responseType: 'blob',
    }).then((response) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(response.data);
      a.setAttribute('download', file.name);
      a.click();
    }).catch((error) => {
      console.error('Download failed:', error);
    });
  };

  export const downloadFileList = (file: FileItem) => {
    const downloadPath = ['/filelist', file.path, file.name].filter(Boolean).join('/');
    axios({ url: downloadPath, responseType: 'blob' }).then((response) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(response.data);
      a.setAttribute('download', file.name + '.tsv');
      a.click();
    });
  };

  export const deleteFile = async (file: FileItem, loading?: Ref<boolean>) => {
    if (!await utils.confirm('Delete File', `Do you want to delete ${file.name}?`, { okayLabel: 'Delete' })) return;
    const body = {
      path: file.path,
      fileName: file.name,
    };
    try {
      if (loading) loading.value = true;
      await axios.post('/api/files/user/delete', body);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  };

  export const renameFile = async (file: FileItem, newName: string, renamingMessage?: Ref<string | null>): Promise<boolean> => {
    if (file.name === newName) return true;
    const body = {
      path: file.path,
      originalName: file.name,
      newName,
    };

    try {
      await axios.post('/api/files/user/rename', body, { responseType: 'json' });
      return true;
    } catch (error: any) {
      console.error('Failed to rename file:', error);
      if (renamingMessage) renamingMessage.value = error.response?.data?.log?.message || 'Failed to rename file';
      return false;
    }
  };



  const uploadFile = (file: File, path: string[], progress: Ref<UploadProgress | null>, abortController?: Ref<AbortController>) => {

    const formData = new FormData();

    // Attach the file
    formData.append('files', file);

    // Attach JSON as a string under key 'filePath'
    formData.append(
      'filePath',
      path.slice(1)
        .map((a) => decodeURIComponent(a))
        .join('/'),
    );

    return axios.post(`/api/files/user/upload`, formData, {
      signal: abortController?.value?.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },

      onUploadProgress: ((progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && progress.value) progress.value.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }),
    });
  };


  export const uploadFiles = async (uploads: FileList | null, isFolderUpload: boolean, path: string[], currentFiles: FileItem[], progress: Ref<UploadProgress | null>, abortController?: Ref<AbortController>) => {
    if (!uploads) return false;

    if (abortController) abortController.value = new AbortController()

    let filesToUpload: File[] = Array.from(uploads);

    if (filesToUpload.find((file) => file.size / GB > HARD_UPLOAD_SIZE_LIMIT)) {
      await utils.confirm(
        `Upload error`,
        `You are trying to upload at least one file larger than ${HARD_UPLOAD_SIZE_LIMIT} GB.<br>This is not supported by this web interface.<br>Please use FTP/Aspera for such large files transfer.`,
        { showCancel: false },
      );
      return false;
    }

    // warn when files are large or more than a threshold
    const largeFiles = filesToUpload.filter(
      (file) => file.size / MB > MAX_UPLOAD_SIZE,
    );
    if (largeFiles.length > 0 || filesToUpload.length > MAX_UPLOAD_FILE_COUNT) {
      const proceed = await utils.confirm(
        `Upload warning`,
        `For uploading files larger than ${MAX_UPLOAD_SIZE} MB or more than ${MAX_UPLOAD_FILE_COUNT} files, using FTP/Aspera is recommended. Do you still want to continue?`,
        { okayLabel: `Yes`, cancelLabel: 'No, cancel' },
      );
      if (!proceed) return false;
    }

    // warn overwrite
    const fileNames = currentFiles?.map((f) => f.name) || [];
    const overlap = filesToUpload
      .map((file) =>
        isFolderUpload
          ? file?.webkitRelativePath.substring(
            0,
            file?.webkitRelativePath.indexOf('/'),
          )
          : file.name,
      )
      .filter((name) => fileNames.includes(name));

    if (overlap.length > 0) {
      const overlapString =
        overlap.length === 1
          ? overlap[0] + '?'
          : overlap.length + ' files? (' + overlap.join(', ') + ')';
      const proceed = await utils.confirm(
        `Overwrite files?`,
        isFolderUpload
          ? 'This may overwrite existing files in the folder. Do you want to go ahead?'
          : `Do you want to overwrite ${overlapString}`,
        { okayLabel: `Yes, overwrite`, cancelLabel: 'No, cancel' },
      );
      if (!proceed) return false;
    }

    // filter hidden files
    const hiddenFiles = filesToUpload.filter((file) => file.name.startsWith('.'));
    if (hiddenFiles.length > 0) {
      // Count filenames to avoid repeating several times the same name
      const counter = hiddenFiles.map(file => file.name)
        .reduce(
          (acc, name) => {
            acc[name] ? acc[name]++ : acc[name] = 1;
            return acc;
          },
          {} as Record<string, number>,
        );
      // Sort by how many time file names appear, and then by their name
      const fileNamesCounts = Object.entries(counter).sort(
        ([nameA, countA], [nameB, countB]) =>
          countB - countA || nameA.localeCompare(nameB),
      );
      // Only display the top 3 kind of hidden filenames
      const examples =
        fileNamesCounts.length > 3
          ? fileNamesCounts.slice(0, 3)
          : fileNamesCounts;

      const introDisplay =
        hiddenFiles.length > 1
          ? `Do you want to include these <b>${hiddenFiles.length}</b> hidden files?`
          : `Do you want to include this hidden file?`;
      let examplesDisplay = examples
        .map(
          ([name, count]) =>
            `<li>${count > 1 ? `<b>${count} x </b> ` : ''} ${name}</li>`,
        )
        .join('');
      if (examples.length !== fileNamesCounts.length)
        examplesDisplay += '<li>...</li>';

      const filter = await utils.confirm(
        `Upload hidden files?`,
        `${introDisplay} <ul>${examplesDisplay}</ul>`,
        {
          okayLabel: `Skip hidden files (${filesToUpload.length - hiddenFiles.length} files)`,
          cancelLabel: `Include all files (${filesToUpload.length} files)`,
          level: 'primary',
        },
      );
      if (filter)
        filesToUpload = filesToUpload.filter(
          (file) => !file.name.startsWith('.'),
        );
    }

    progress.value = { name: '', progress: 0 };
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      progress.value.name = file.name;
      try {
        await uploadFile(file, path, progress, abortController);
      } catch (e: any) {
        if (e?.message === 'canceled') i = filesToUpload.length; // Cancel everything when hitting cancel
        progress.value = null;
        return false;
      }
    }
    progress.value = null;
    return true;
  };
}

