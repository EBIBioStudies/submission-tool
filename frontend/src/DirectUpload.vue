<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import AuthService from "@/services/AuthService";
import axios from "axios";
import { from, Subject, Observable } from 'rxjs';
import { map, mergeAll, last, takeUntil, catchError } from 'rxjs/operators';

const fileInput = ref(null);
const folderInput = ref(null);
const selectedFiles = ref([]);
const collections = ref([]);
const selectedCollection = ref(null);
const ngUnsubscribe = new Subject();
const uploadResults = ref([]);
const successSubmit = ref(false);
const errorMessage = ref(null);
const showModalMessage = ref(false);
const loading = ref(false);

const triggerFileSelect = () => {
  fileInput.value.click();
};

const triggerFolderSelect = () => {
  folderInput.value.click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      addUniqueFile(files[i]);
    }
  }
};

const handleFolderChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      addUniqueFile(files[i]);
    }
  }
};

const hasStudyExtension = (fileName) => {
  const extensions = [".json", ".xml", ".tsv", ".xlsx"];
  return extensions.some(ext => fileName.endsWith(ext));
};

const addUniqueFile = (file) => {
  const isDuplicate = selectedFiles.value.some(f => f.name === file.name && f.size === file.size);
  if (!isDuplicate) {
    file.isChecked = false;
    file.hasStudyExtension = hasStudyExtension(file.name);
    file.status = 0;
    file.progress = 0;
    selectedFiles.value.push(file);
    if(successSubmit.value)
      successSubmit.value = false;
  }
};

const getCheckedFiles = () => {
  return selectedFiles.value.filter(file => file.isChecked);
};

const getNonCheckedFiles = () => {
  return selectedFiles.value.filter(file => !file.isChecked);
};

const removeFile = (file) => {
  selectedFiles.value = selectedFiles.value.filter(f => !(f.name === file.name && f.size === file.size));
};

const submitForm = () => {
  const studyFiles = selectedFiles.value.filter(file => file.isChecked);
  const nonStudyFiles = selectedFiles.value.filter(file => !file.isChecked);

  if (studyFiles.length === 0) {
    showModalMessage.value = true;
    return;
  }

  errorMessage.value = "";
  successSubmit.value = false;
  loading.value = true;

  const uploads$ = from([...nonStudyFiles, ...studyFiles]).pipe(
    map(file => file.isChecked ? doUploadStudyFile(file) : doUploadRegularFile(file)),
    mergeAll(20), // assuming maxConcurrent is 20
    takeUntil(ngUnsubscribe),
    catchError(err => {
      errorMessage.value = err?.message || 'Unknown error';
      loading.value = false;
      return [];
    })
  );

  uploads$.subscribe({
    next: (result) => {
      uploadResults.value.push(result);
    },
    complete: () => {
      updateSelectedFiles();
      if (!uploadResults.value.some(file => file.status === 2)) {
        successSubmit.value = true;
        resetForm();
      }
      loading.value = false;
    },
    error: (error) => {
      errorMessage.value = error?.message || 'Unknown error';
      loading.value = false;
    }
  });
};

const updateSelectedFiles = () => {
  uploadResults.value.forEach(result => {
    const index = selectedFiles.value.findIndex(f => f.name === result.name && f.size === result.size);
    if (index !== -1) {
      selectedFiles.value[index] = result;
    }
  });
};

const resetForm = () => {
  uploadResults.value = [];
  selectedFiles.value = [];
  selectedCollection.value = collections.value.find(col => col.title === "None") || null;
};

onMounted(async () => {
  if (!AuthService.isAuthenticated()) return;
  try {
    const response = await axios.get(`/api/collections`);
    collections.value = response.data;
    const none = { accno: "none", title: "None" };
    collections.value.push(none);
    selectedCollection.value = none;
  } catch (error) {
    console.error('Failed to fetch collections:', error);
  }
});

const uploadFiles = (files, isStudyFile) => {
  return from(files).pipe(
    map((file) => isStudyFile ? doUploadStudyFile(file) : doUploadRegularFile(file)),
    takeUntil(ngUnsubscribe)
  );
};

const doUploadRegularFile = (file) => {
  if (file?.progress==100 && file.status==1)
    return;
  return new Observable((observer) => {
    const formData = new FormData();
    formData.append('files', file);

    axios.post('/api/files/user/', formData, {
      onUploadProgress: (progressEvent) => {
        file.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      }
    })
      .then(() => {
        file.status = 1;
        file.progress = 100;
        observer.next(file);
        observer.complete();
      })
      .catch((error) => {
        file.status = 2;
        file.progress = 0;
        file.message = error.response?.data || error.message || 'Unknown error';
        errorMessage.value = error?.response?.data?.log?.message || error?.message || 'Unknown Error';
        observer.next(file);
        observer.complete();
      });
  });
};

const doUploadStudyFile = (file) => {
  return new Observable((observer) => {
    const formData = new FormData();
    if (selectedCollection.value.name) {
      const collection = { name: 'AttachTo', value: selectedCollection.value.name };
      formData.append('attributes', JSON.stringify(collection));
    }
    formData.append('submission', file);

    axios.post('/api/submissions/async/direct', formData, {
      onUploadProgress: (progressEvent) => {
        file.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      }
    })
      .then(() => {
        file.status = 1;
        file.progress = 100;
        observer.next(file);
        observer.complete();
      })
      .catch((error) => {
        file.status = 2;
        file.progress = 0;
        file.message = error.response?.data || error.message || 'Unknown error';
        errorMessage.value = error?.response?.data?.log?.message || error?.message || 'Unknown Error';
        observer.next(file);
        observer.complete();
      });
  });
};

const moveCheckedFileToTop = (file) => {
  // Remove the file from its current position
  selectedFiles.value = selectedFiles.value.filter(f => f !== file);
  // Add the file to the beginning if checked, otherwise add it to the end
  if (file.isChecked) {
    selectedFiles.value.unshift(file);
  } else {
    selectedFiles.value.push(file);
  }
};


onBeforeUnmount(() => {
  ngUnsubscribe.next();
  ngUnsubscribe.complete();
});
</script>


<template>

  <div class="container-fluid">

    <div v-if="showModalMessage" class="message-box">
      <div class="message-content">
        <div class="message-header">
          <span class="message-title">Info</span>
          <button type="button" class="close" @click="showModalMessage = false">&times;</button>
        </div>
        <div class="message-body">
          <p>Please, select at least one study File!</p>
        </div>
        <div class="message-footer">
          <button type="button" class="btn btn-primary" @click="showModalMessage = false">OK</button>
        </div>
      </div>
    </div>

    <div class=" row">
      <div class="col-2">
        <div  class="d-md-block sidebar sidebar-expanded border-right">
          <div class="sidebar-container">
            <div v-if="loading" class="card">
              <div  class="d-flex justify-content-center">
                <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin fa-spinner fa-2x" />
              </div>
            </div>

            <div v-else class="card">
              <div class="form-group mt-3 mx-3">
                <div class="border-bottom mb-2 d-flex align-items-center justify-content-between">
                  <label  class="m-0">Files</label>
                  <span  class=" m-0"> {{ selectedFiles.length }} </span>
                </div>
                <div class="btn-group border-bottom mb-2">
                  <button @click="triggerFileSelect" class="btn btn-primary btn-sm w-25  left-btn mx-1">Add File</button>
                  <button @click="triggerFolderSelect" class="btn btn-primary  btn-sm  w-25  right-btn mx-1">Add Folder</button>
                  <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" multiple>
                  <input type="file" ref="folderInput" @change="handleFolderChange" webkitdirectory directory style="display: none;">
                </div>
              </div>

              <div class="form-group mx-3">
                <div class="form-group">
                  <div class="border-bottom mb-2 d-flex align-items-center justify-content-between">
                    <label class="m-0">Collection</label>
                    <span class="text-muted"><i>Optional</i></span>
                  </div>
                  <div v-for="col in collections" :key="col" class="ng-star-inserted">
                    <label>
                      <input type="radio" name="project" class="ng-untouched ng-pristine ng-valid" :value="col" v-model="selectedCollection">
                      {{ col.title }}
                    </label>
                  </div>
                  <div class="d-flex justify-content-center">
                    <button @click="submitForm" id="single-button" type="button" class="btn btn-success btn-submit"> Upload </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div class="col-9 gy-9">
        <div  class="card">
          <div v-if="!successSubmit && !errorMessage">
            <div  class="card-body">
              <p>Please fill in the form on the left-hand side to upload your studies:</p>
              <ul>
                <li>
                  <strong>
                    Provide the study files
                  </strong>
                  <p>
                    Use the <i>"Add File"</i> button to pick files from different directories. <br />
                    Use the <i>"Add Folder"</i> button to upload all the files in a directory. <br />
                  </p>
                </li>
                <li >
                  <strong>Which collections are you attaching your studies to?</strong>
                  <p>Choose the collections all your files will be attached to. If no collection is selected, studies
                    will be uploaded as stand-alone and will be allocated an accession number with format
                    <i>S-BSST&lt;number&gt;</i>.
                  </p>
                </li>
              </ul>
              <strong>Are you updating existing studies?</strong>
              <p>
                <mark>
                  To update a study please provide the accession number in the <strong>"Submission"</strong> attribute within the study file (cell B1). If
                  no value for the <strong>"Submission"</strong> attribute is found, a new study will be created, with a new accession number.
                </mark>
              </p>
              <strong>Supported extensions for studies</strong>
              <p>
                The extension of the file containing the study information should be <strong>.json, .xml, .tsv or .xlsx</strong>
              </p>
            </div>
          </div>
          <div v-if="errorMessage" class="alert" >
            <div  class=" alert alert-danger">
              <h4>Error while uploading study</h4>
              <p>The study highlighted below is invalid or an unexpected
                error was encountered.</p>
              <p>Please try to correct any issues before uploading the affected
                files again.</p>
            </div>
          </div>

          <div v-if="successSubmit" class="alert alert-success">
            <h4>Study uploaded</h4>
            <p>
              The study has been uploaded to the BioStudies database. <br />
            </p>
            <div class="mt-3">
              <h5>Please note <i class="far fa-hand-point-down"></i></h5>
              <ul>
                <li class="mb-3">
                  <mark>Data processing time depends on the number and size of your files.</mark>
                </li>
                <li class="mb-3">
                  <mark>
                    If there are any further validation errors, they will be available from the Submissions list page.
                  </mark>
                </li>
                <li class="mb-3">
                  <mark>
                    On successful processing you will receive the study accession number by e-mail.
                  </mark>
                </li>
                <li class="mb-3">
                  <mark>
                    The study will remain private and accessible only via login until the release date in the Western European Time Zone.
                  </mark>
                </li>
              </ul>
            </div>

            <strong> <a href="http://europepmc.org/abstract/MED/26700850" target="_blank"> Citing the BioStudies database <i
              class="fa fa-fw fa-external-link-square"></i> </a> </strong>
            <p>
              Sarkans U, Gostev M, Athar A, et al. <a href="http://doi.org/10.1093/nar/gkx965">The BioStudies database-one
              stop shop for all data supporting a life sciences study. </a> <i>Nucleic Acids Res.</i> 2018;46(D1):D1266-D1270.
              doi:10.1093/nar/gkx965 </p>
          </div>
        </div>

        <div class="st-direct-upload-files-grid mt-3">
          <div v-for="file in selectedFiles" :key="file.name + file.size" class="card h-100 panel-default" style="cursor: default;">
            <div class="card-body">
              <div class="card-title d-flex align-items-center">
                <div>
                  <font-awesome-icon v-if="file.status==0" :icon="['fas', 'plus']" class="fa-1x st-panel-description-icon green-icon" />
                  <font-awesome-icon v-if="file.status==1" :icon="['fas', 'check-circle']" class="fa-1x st-panel-description-icon green-icon"/>
                  <font-awesome-icon v-if="file.status==2" :icon="['fas', 'times-circle']" class="fa-1x st-panel-description-icon error-icon" />
                </div>
                <h5 class="st-direct-submit-file-name m-0">{{ file.name }}</h5>
              </div>
              <span class="text-danger" v-if="file.status===2">{{file.message}}</span>
              <div v-if="file.progress > 0">
                <p>Uploading: {{ file.progress }}%</p>
                <progress :value="file.progress" max="100"></progress>
              </div>
            </div>
            <div class="card-footer d-flex align-items-center">
              <div  class="flex-grow-1">
                <button v-if="file.hasStudyExtension" class="btn btn-link text-muted d-inline p-0">
                  <label class="sr-only" :for="'is-study-checkbox-' + file.name">Is {{ file.name }} containing the study information?</label>
                  <input type="checkbox" :id="'is-study-checkbox-' + file.name" v-model="file.isChecked" @change="moveCheckedFileToTop(file)"> Study File
                </button>
              </div>
              <button type="button" class="btn btn-outline-danger btn-sm d-flex align-items-center" :aria-label="'Delete file ' + file.name" :title="'Delete file ' + file.name" @click="removeFile(file)">
                <font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<style scoped>
  .btn-group {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .left-btn {
    margin-right: auto;
  }

  .right-btn {
    margin-left: auto;
  }

  .st-direct-submit-file-name {
    word-wrap: anywhere;
  }


  .sidebar {
    background-color: #6d9fc1;
    bottom: 0;
    left: 0;
    padding:  64px 0 0;
    position: fixed;
    top: 80px;
    z-index: 9;
    overflow: auto;
  }

  .sidebar-expanded {
    width: 260px
  }

  .green-icon {
    color: green;
  }
 .st-direct-upload-files-grid {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
   gap: 16px;
 }

  .message-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 400px;
    background: rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .message-content {
    background: #f0f9ff;
    padding: 20px;
    border-radius: 8px;
    width: 100%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d1e7ff;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .message-title {
    font-size: 18px;
    font-weight: bold;
    color: #0275d8;
  }

  .message-body {
    font-size: 16px;
    color: #333;
  }

  .message-footer {
    display: flex;
    justify-content: flex-end;
  }


  .btn-primary:hover {
    background-color: #025aa5;
  }

  .error-icon {
    color: red;
  }
  .fa-spinner {
    color: #0275d8;
    margin-top: 20px;
  }

</style>
