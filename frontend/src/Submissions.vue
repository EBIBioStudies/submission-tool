<template>
  <div class="container">
    <div><AnnouncementBanner /></div>
    <NewSubmission @select="(e) => console.log(e)"></NewSubmission>
    <div class="d-flex justify-content-center">
      <span class="ps-1" :class="{ invisible: !isLoading }"
        ><font-awesome-icon class="fa-spin" icon="fa-solid fa-spinner"
      /></span>
    </div>
    <div
      v-if="serverListingSubsErrorMessage"
      class="alert alert-danger"
      role="alert"
    >
      <div class="card-body">
        {{ serverListingSubsErrorMessage }}
      </div>
    </div>
    <table class="table table-responsive table-striped table-hover">
      <thead>
        <tr>
          <th style="min-width: 120px">
            Accession
            <font-awesome-icon
              style="margin-left: 1em"
              role="button"
              @click="searchAccession"
              icon="fa-solid fa-filter"
              size="xs"
            ></font-awesome-icon>
            <span
              v-if="accessionToSearch"
              role="button"
              @click="accessionToSearch = ''"
              class="badge text-bg-secondary filter"
              >{{ accessionToSearch }}
              <font-awesome-icon icon="fa-solid fa-xmark" size="xs" />
            </span>
          </th>

          <th>
            Title
          </th>
          <th style="min-width: 120px">Release Date</th>
          <th style="min-width: 120px">Last Modified</th>
          <th style="min-width: 140px">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="submission in submissions">
          <td>
            <template v-if="submission?.status === 'PROCESSED'">
              {{ submission.accno }}
            </template>

            <template v-else-if="submission?.status === 'INVALID'">
              <button
                class="btn btn-outline-danger btn-sm"
                @click="showErrors(submission.errors)"
              >
                View Errors
              </button>
              <div>{{ submission.accno }}</div>
            </template>

            <template v-else>
              <font-awesome-icon
                :icon="['fas', 'spinner']"
                class="spinner-border spinner-border-sm status-spinner fa-spin"
              />
              {{ submission.accno }}
            </template>
          </td>

          <td>{{ submission.title }}</td>
          <td>{{ moment(submission.rtime).format('DD MMM YYYY') }}</td>
          <td>{{ moment(submission.mtime).format('DD MMM YYYY') }}</td>
          <td>
            <button
              v-if="submission.status === 'PROCESSED'"
              class="btn btn-link text-primary"
              @click.stop="open(submission.accno)"
            >
              <font-awesome-icon
                icon="fa-solid fa-arrow-up-right-from-square"
              ></font-awesome-icon>
            </button>
            <button
              v-if="
                submission.status === 'PROCESSED' ||
                submission.status === 'INVALID'
              "
              class="btn btn-link text-primary"
              @click.stop="edit(submission.accno)"
            >
              <font-awesome-icon icon="fa-edit"></font-awesome-icon>
            </button>
            <button
              v-if="canDelete(submission)"
              class="btn btn-link text-primary"
              @click.stop="deleteSubmission(submission.accno)"
            >
              <font-awesome-icon
                icon="fa-regular fa-trash-alt"
              ></font-awesome-icon>
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="border-white">
          <td colspan="5" class="text-end">
            <button
              v-if="offset > 0"
              class="btn btn-outline-primary btn-sm m-2"
              @click="offset -= pageLength"
            >
              <font-awesome-icon icon="fa-chevron-left"></font-awesome-icon>
              Previous
            </button>
            <button
              v-if="showNext"
              class="btn btn-outline-primary btn-sm m-2"
              @click="offset += pageLength"
            >
              <font-awesome-icon icon="fa-chevron-right"></font-awesome-icon>
              Next
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
    <div v-if="!submissions.length" class="alert alert-secondary text-center">
      No submissions. You can click the <b>New Submissions</b> button to start a
      new study draft.
    </div>
  </div>
  <a href="https://www.ebi.ac.uk/biostudies/studies/" target="_blank">
    Search published submissions
    <font-awesome-icon
      icon="fa-solid fa-external-link-square"
    ></font-awesome-icon>
  </a>
  <!-- Error Modal, shown only if showModal is true -->
  <SubmissionErrorsModal
    v-if="showModal"
    :errors="currentErrors"
    @hide="showModal = false"
  />
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import AuthService from './services/AuthService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import router from './router';
import axios from 'axios';
import NewSubmission from '@/components/NewSubmission.vue';
import SubmissionErrorsModal from '@/components/SubmissionErrorsModal.vue';
import utils from '@/utils';
import AnnouncementBanner from '@/components/AnnouncementBanner.vue';
//init ci/cd test
const accession = ref('');
const submissions = ref([]);
const offset = ref(0);
const pageLength = ref(15);
const showNext = ref(false);
const isLoading = ref(true);
const accessionToSearch = ref('');
const serverListingSubsErrorMessage = ref('');

const showModal = ref(false);
const currentErrors = ref([]);

const showErrors = (errors) => {
  currentErrors.value = errors;
  showModal.value = true;
};

const canDelete = (submission) => {
  return (
    (['S-', 'TMP_'].some((prefix) => submission.accno.indexOf(prefix) >= 0) &&
      new Date(submission?.rtime).getTime() > Date.now() &&
      submission.status === 'PROCESSED') ||
    AuthService.user?.value?.superuser
  );
};
const deleteSubmission = async (accno) => {
  if (
    !(await utils.confirm(
      'Delete draft',
      `The submission with accession number ${accno} may have un-submitted changes. If you proceed, both the submission and any changes will be permanently lost.`,
      'Delete',
    ))
  )
    return;
  isLoading.value = true;
  const response = await axios.delete(`/api/submissions/${accno}`);
  isLoading.value = false;
  if (response.status === 200) {
    location.reload();
  }
};

/**
 * Watches relevant reactive state for search criteria changes and user authentication.
 *
 * When the user is authenticated, this watcher triggers data fetching from the server
 * whenever the search inputs (accession), pagination offset, or page length change.
 *
 * Search behavior:
 * - If there is an accession search term, the query will exclusively search by accession,
 *   ignoring pagination.
 *
 * Sets loading and error state during the async request, and updates the submissions list,
 * also sets a flag if there are more submissions for pagination.
 */
watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return;

  const hasAccession = accessionToSearch.value.trim() !== '';

  try {
    isLoading.value = true;
    serverListingSubsErrorMessage.value = null;

    const response = await axios.get('/api/submissions', {
      params: hasAccession
        ? { accNo: accessionToSearch.value.trim() }
        : {
            offset: offset.value,
            limit: pageLength.value + 1
          },
    });

    submissions.value = response.data.slice(0, pageLength.value);
    showNext.value = response.data.length === pageLength.value + 1;
  } catch (error) {
    serverListingSubsErrorMessage.value =
      error?.log?.message || error?.message || 'Problem in listing submissions';
  } finally {
    isLoading.value = false;
  }
});

const edit = (accno) => {
  router.push(`/edit/${accno}`);
};

const open = (accno) => {
  window.open(`${window.config.frontendUrl}/studies/${accno}`);
};

/**
 * Prompts the user to search for an accession.
 */
const searchAccession = async () => {
  accessionToSearch.value = await utils.prompt(
    'Search accession',
    `Please enter the accession to search`,
    'Search',
  );
};

</script>

<style scoped>
.filter {
  font-weight: normal;
  font-size: 10pt;
  margin-left: 1em;
}
</style>
