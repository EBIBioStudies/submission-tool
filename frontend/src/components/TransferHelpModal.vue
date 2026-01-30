<script setup>

import AuthService from '../services/AuthService';
import { computed, ref } from 'vue';

const user = computed(() => AuthService.user.value);

const secret = computed(() => '/' + AuthService.user.value.secret);
const uploadType = computed(() => user.value?.uploadType || '');

const asperaVersion = computed(() =>
  uploadType.value === 'ftp' ? '4.2.12' : '3.11.2'
);
const selectedOS = ref('Windows');
const platform = computed(()=>selectedOS.value==='Windows'?'Windows': (selectedOS.value==='Linux'?'Linux':'Mac+OSX'));

</script>

<template>
  <!-- Modal -->
  <div id="transferHelpModal" aria-hidden="true" aria-labelledby="transferHelpModal" class="modal fade modal-lg"
       tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">FTP/Aspera Upload</h1>
          <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
        </div>
        <div class="modal-body">
          <div class="pb-3">
            You can upload directories to your BioStudies file space via FTP or Aspera. Please click on the relevant
            method below. Your secret directory is <code>{{ secret }}</code>
          </div>
          <div id="transferAccordion" class="accordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button aria-controls="collapseOne" aria-expanded="true" class="accordion-button"
                        data-bs-target="#collapseOne" data-bs-toggle="collapse" type="button">
                  Upload using FTP
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#transferAccordion">
                <div class="accordion-body">
                  <p>You can use any FTP client to upload your data, such as <a
                    href="https://filezilla-project.org/download.php?type=client" target="_blank">FileZilla</a>.</p>
                  <p>The FTP credentials are:</p>
                  <ul>
                    <li>Host: <code>ftp-private.ebi.ac.uk</code></li>
                    <li>
                      Username: <code>{{ uploadType === 'ftp' ? 'bs-upload' : 'bsftp' }}</code>
                    </li>

                    <li>Password: <code>{{uploadType === 'ftp' ? 'vsr5nW7Y' : 'bsftp1'}}</code></li>
                    <li>Secret directory: <code>{{ secret }}</code></li>
                  </ul>
                  <p>Please use the credentials above to connect to the FTP server, and then upload your submission
                    files into your secret directory. </p>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button aria-controls="collapseTwo" aria-expanded="false" class="accordion-button collapsed"
                        data-bs-target="#collapseTwo" data-bs-toggle="collapse" type="button">
                  Upload using Aspera
                </button>
              </h2>
              <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#transferAccordion">
                <div class="accordion-body">
                  <div class="d-inline-block">
                    Instructions for <select v-model="selectedOS">
                    <option value="Windows">Windows</option>
                    <option value="Mac OS">Mac OS</option>
                    <option value="Linux">Linux</option>
                  </select>

                    <p class="pt-3"> The <strong>Aspera</strong>&nbsp;<em>ascp</em> command line client is distributed
                      as part of <a
                        :href="`https://www.ibm.com/support/fixcentral/swg/selectFixes?parent=ibm%7EOther%20software&product=ibm/Other+software/IBM+Aspera+Connect&release=${asperaVersion}&platform=${platform}&function=all`"
                        target="_blank"> <strong>IBM Aspera Connect ({{asperaVersion}})</strong></a>. You might need to create a
                      new IBMid for downloading. After installation, you can use the <em>ascp</em> tool, e.g.,</p>
                    <div v-if="uploadType==='nfs'" id="eg">
                      <div v-if="selectedOS === 'Mac OS'">
                        <code>$ ~/Applications/Aspera\ Connect.app/Contents/Resources/ascp -P33001 -i
                          ~/Applications/Aspera\ Connect.app/Contents/Resources/asperaweb_id_dsa.openssh -d &lt;directory
                          to upload&gt; bsaspera_w@hx-fasp-1.ebi.ac.uk:&lt;secret directory></code>
                      </div>
                      <div v-if="selectedOS === 'Linux'">
                        <code>$ tar -zxvf ibm-aspera-connect-3.11.2.63-linux-g2.12-64.tar.gz<br/>
                          $ ./ibm-aspera-connect-3.11.2.63-linux-g2.12-64.sh<br/>
                          $ ~/.aspera/connect/bin/ascp -P33001 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh -d &lt;directory to upload&gt; bsaspera_w@hx-fasp-1.ebi.ac.uk:&lt;secret directory></code>
                      </div>
                      <div v-if="selectedOS === 'Windows'">
                        <code>C:\>"C:\Users\alice\AppData\Local\Programs\Aspera\Aspera Connect\bin\ascp.exe"
                          -P33001 -i "C:\Users\alice\AppData\Local\Programs\Aspera\Aspera Connect\etc\asperaweb_id_dsa.openssh"
                          -d &lt;directory to upload&gt; bsaspera_w@hx-fasp-1.ebi.ac.uk:&lt;secret directory&gt;</code>
                      </div>
                      <p class="mt-2">where</p>
                      <ul>
                        <li><code>-P33001</code> and <code>bsaspera_w@hx-fasp-1.ebi.ac.uk</code> defines port, user and
                          server for the Aspera connection.
                        </li>
                        <li><code>&lt;directory to upload&gt;</code> is the path of the directory to be uploaded.</li>
                        <li><code>&lt;secret directory&gt;</code> looks like <code>xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxx</code>
                          and is shown above.
                        </li>
                      </ul>
                    </div>
                    <div v-else id="eg-els">
                      <div class="code-block">
                        <p><code>ascp -k 1 -QT -l 400M -P33001 &lt;directory to upload&gt; bs-upload@fasp.ebi.ac.uk:&lt;secret directory&gt;</code></p>
                      </div>

                      <p>where</p>
                      <ul>
                        <li><code>&lt;directory to upload&gt;</code> is the path of the local directory to be uploaded.</li>
                        <li><code>&lt;secret directory&gt;</code> looks like <code>xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxx</code> and is shown above.</li>
                        <li>Password: <code>vsr5nW7Y</code></li>
                      </ul>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal" type="button">Close</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>
