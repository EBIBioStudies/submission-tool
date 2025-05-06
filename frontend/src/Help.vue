<script setup>

import FileFolderSelectModal from "./components/FileFolderSelectModal.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {ref} from "vue";

const attr = {path:'/user/structures.svg'};
const filePath = ref(attr.path)
</script>

<template>
  <main class="container pt-4">
    <section class="row">
      <div>
        <h3>Help</h3>
        <ol>
          <li class="py-2">
            <router-link :to="{ path: '/help', hash: '#help-list' }">Listing all your studies</router-link>
          </li>
          <li class="py-2">
            <router-link :to="{ path: '/help', hash: '#help-files' }">Uploading files</router-link>
          </li>
          <li class="py-2">
            <router-link :to="{ path: '/help', hash: '#help-start' }">Starting a new submission</router-link>
          </li>
          <li class="py-2">
            <router-link :to="{ path: '/help', hash: '#help-edit' }">Editing a study</router-link>
          </li>
          <li class="py-2">
            <router-link :to="{ path: '/help', hash: '#help-save' }">Saving and submitting a study</router-link>
          </li>
          <li class="py-2">
            <router-link :to="{ path: '/help', hash: '#help-about' }">About</router-link>
            <a href="mailto:biostudies@ebi.ac.uk?Subject=Submission%20Tool" class="float-right">
              <font-awesome-icon icon="envelope-square" />
              Contact us
            </a>
          </li>
        </ol>
        <dl>
          <dt id="help-list" class="border-bottom"><h4>1. Listing your studies</h4></dt>
          <dd class="pt-2">
            <p>
              Your submissions are listed in two tabs.

            </p>
            <ul>
              <li>
                <strong><font-awesome-icon icon="database" /> Studies</strong>:
                Submissions that have already been submitted to the BioStudies database.
              </li>
              <li>
                <strong><font-awesome-icon icon="clock" /> Drafts</strong>:
                New studies which are incomplete or updates of the existing studies that have not been
                submitted to the BioStudies database yet. New studies have a temporary identifier starting with
                <i>TMP_</i>.
              </li>
            </ul>
            <p>
              Entries in either tabs can be edited or deleted using
              <span class="btn-group btn-group-sm">
              <button type="button" class="btn btn-link btn-sm">
                <font-awesome-icon icon="pencil-alt" />
              </button> or
              <button type="button" class="btn btn-link btn-sm">
                <font-awesome-icon icon="trash-alt" class="fa-fw" />
              </button>
            </span>
              under the <i>"Actions"</i> column respectively. Released submissions cannot be deleted.
              The entire list can be filtered by pressing the
              <span class="ag-fresh">
              <font-awesome-icon icon="filter" />
            </span>
              icon in the relevant column.
            </p>
          </dd>
          <img class="help-img" src="/images/help/submission_list.png" alt="Submission list example" />

          <dt id="help-files" class="border-bottom"><h4>2. Uploading files</h4></dt>
          <dd class="pt-2">
            <p>
              Each user's files are stored in a central repository and made available for all your
              submissions. To navigate and list all your files, click on
              <button class="btn btn-link">
                <font-awesome-icon icon="folder-open" />
                Files
              </button>
              in the navigation bar. Click the
              <button type="button" class="btn btn-primary btn-sm">
                Upload file
              </button>
              or
              <button type="button" class="btn btn-primary btn-sm">
                Upload folder
              </button>
              button above the list to select additional files to upload to your folder.
              For large information volumes (i.e., number and/or size of files) <strong>FTP/Aspera</strong> can be used
              for uploads. You will need to know your secret directory to be able to upload data
              into your BioStudies Files area. This can be obtained by clicking on
              <button type="button" class="btn btn-info btn-sm">FTP/Aspera</button>
              and
              following the instructions.
            </p>
          </dd>
          <dt id="help-start" class="border-bottom"><h4>3. Starting a new submission</h4></dt>
          <dd class="pt-2">
            <p>
              You can click on the <strong>New Submissions</strong> button to start a new study draft. You will be asked
              to select the collection that you are submitting to. Please select <strong>Default</strong> for
              general submissions to BioStudies. For submissions to BioImage Archive, please <a
              href="https://www.ebi.ac.uk/bioimage-archive/submit/">read the guide here</a> before proceeding. After
              clicking
              <button type="button" class="btn btn-primary btn-sm">Add</button>
              you will be presented with a collection specific form for <router-link :to="{ path: '/help', hash: '#help-edit' }">editing your study.</router-link>
            </p>
            <img class="help-img" src="/images/help/new_submission.png" width="650" alt="Collection dialog" />

          </dd>
          <dt id="help-edit" class="border-bottom"><h4>4. Editing a study</h4></dt>
          <dd class="pt-2">
            <p>
              In most submission forms, only some of the fields may be required, such as the study's title or
              its release date. The required fields are marked by an asterisk. If there are errors, an attempt to Submit the form will result in a Validation panel appearing on the right hand side.
              Clicking on any entry in the validation errors list
              sets the focus on the relevant field, scrolling directly to it if needed.
            </p>
            <p><img class="help-img" src="/images/help/check_tab.png" alt="Submission validation example" /></p>
            <p>Some optional groups of fields include mandatory fields, but the entire group can be deleted if not
              relevant. For example, if "Links" are not relevant for your dataset, click the Delete icon on the right hand side.
              Dropdowns in the submission form allow to enter new items; this applies to Organism,
              Organisation and any other dropdown.
            </p>

            <p></p>
            <p>
              A study can be edited at any point of its lifecycle. Editing a submitted study will create a new
              <i>"Draft"</i>. Any recent changes in this draft can be cancelled, reverting the form to its previous state
              before the changes. New fields may be added by clicking on the "+" icons in the submission tree, or "New Attribute" or "Add Row" buttons if relevant, depending on the submission template.
            </p>
            <p><img class="help-img" src="/images/help/add_tab.png" alt="Add new elements to submission form example" />
            </p>
          </dd>
          <dt id="help-save" class="border-bottom"><h4>5. Saving and submitting a study</h4></dt>
          <dd class="pt-2">
            <p>
              You can leave an incomplete form and come back to it later.
            </p>
            <p>
              Once all the study data has been provided and validated, the form can be submitted by pressing the
              <button type="button" class="btn btn-primary btn-sm">Submit</button>
              button, located at the top of the form. If there are no validation error, you will receive
              further information on the following page. The accession number of your submission will be sent via e-mail after it has been
              processed.
            </p>
            <p id="help-license">New datasets in BioStudies are released into the public domain under the terms of a <a
              href="https://creativecommons.org/publicdomain/zero/1.0/legalcode">Creative Commons Zero (CC0) waiver</a>.
              Some collections support also other licenses. Where no license is stated, data are available under the <a
                href="https://www.ebi.ac.uk/about/terms-of-use/">EMBL-EBI Terms of Use</a>.</p>
            <p>
              BioStudies submission tool also allows the automatic extraction of study data from a selected pre-formatted
              file. This study file has to follow the <a
              href="https://www.ebi.ac.uk/biostudies/misc/SubmissionFormatV5a.pdf">PageTab</a> format. PageTab
              files/folders
              can be submitted by clicking the down-arrow button on the right side of "New Submission" and selecting
              "Submit PageTab".

              <img class="help-img" src="/images/help/new_submission_dropdown.png" alt="New submission draft" />
            </p>
            <p>
              In case of any issues during the submission process, please <a href="mailto://biostudies@ebi.ac.uk">contact
              us</a>.
            </p>

            <div class="alert alert-warning" role="alert">
              <strong>⚠ Please note:</strong> Data processing time depends on the number and size of your files. The study will remain private and accessible only via login until the release date in the Western European Time Zone.
            </div>
            <div class="alert alert-warning" role="alert">
              <strong>⚠ Please note:</strong> While a submission is being processed, a <span class="badge badge-primary">
          Processing<i class="spinner-border spinner-border-sm status-spinner"></i></span> icon will appear next to
              the title, and any actions will not be possible. This may happen also while we perform internal maintenance.
              If you urgently need to update your submission in these cases, please contact us. Any further validation errors not detected during the form editing phase will be available from the Submissions list page.
            </div>
          </dd>
          <dt id="help-about" class="border-bottom"><h4>6. About</h4></dt>
          <dd class="pt-2">
            <p>
              The submission tool is a single-page app based on the
              <a href="https://github.com/vuejs">Vue</a>
              framework and the <a href="https://github.com/twbs/bootstrap">Bootstrap</a> library.
              You can reach us at
              <a href="mailto:biostudies@ebi.ac.uk?Subject=Submission%20Tool">biostudies[at]ebi.ac.uk</a>.
            </p>
          </dd>
        </dl>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Smooth anchor scroll offset */
dt[id] {
  scroll-margin-top: 90px;
  padding-top: 1rem;
  border-bottom: 2px solid #dee2e6;
  margin-top: 2rem;
}

main.container {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

h3 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

ol {
  padding-left: 1rem;
  margin-bottom: 2rem;
  list-style: decimal inside;
}

ol li {
  font-size: 1rem;
  line-height: 1.6;
}

.router-link-active,
.router-link-exact-active {
  font-weight: bold;
  color: #007bff;
  text-decoration: underline;
}

dd {
  margin-left: 0;
  padding-left: 0;
}

dd p, dd ul, dd li {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
}

.help-img {
  margin: 1.5rem 0;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.alert {
  margin-top: 1rem;
  font-size: 0.95rem;
}

button.btn {
  margin: 0.25rem;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.float-right {
  float: right;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.status-spinner {
  color: #343a40; /* Bootstrap's dark */
}

.badge-primary{
  color: #343a40;
}
</style>
