<script setup>

import AuthService from "../services/AuthService";
import {computed, ref} from "vue";

const secret = computed(() => location.hostname.startsWith('www.ebi.ac.uk') ? '/' : '/.beta/' + AuthService.user.value.secret)
const selectedOS = ref('Windows');

</script>

<template>
  <!-- Modal -->
  <div class="modal fade modal-lg" id="transferModal" tabindex="-1" aria-labelledby="transferModal" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">FTP/Aspera Upload</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="pb-3">
            You can upload directories to your BioStudies file space via FTP or Aspera. Please click on the relevant
            method below. Your secret directory is <code>{{ secret }}</code>
          </div>
          <div class="accordion" id="transferAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne"
                        aria-expanded="true" aria-controls="collapseOne">
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
                    <li>Username: <code>bsftp</code></li>
                    <li>Password: <code>bsftp1</code></li>
                    <li>Secret directory: <code>{{ secret }}</code></li>
                  </ul>
                  <p>Please use the credentials above to connect to the FTP server, and then upload your submission
                    files into your secret directory. </p>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  Upload using Aspera
                </button>
              </h2>
              <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#transferAccordion">
                <div class="accordion-body">
                  <div class="d-inline-block">
                    Instructions for
                    <select v-model="selectedOS">
                      <option value="Windows">Windows</option>
                      <option value="Mac OS">Mac OS</option>
                      <option value="Linux">Linux</option>
                    </select>

                    <p class="pt-3"> The Aspera <em>ascp</em> command line client is distributed
                      as part of Aspera CLI.</p>

                    <div v-if="selectedOS === 'Mac OS'">
                      <ol>
                        <li><a target="_blank"
                                        href="https://www.ibm.com/support/fixcentral/swg/selectFixes?parent=ibm%7EOther%20software&product=ibm/Other+software/IBM+Aspera+CLI&release=All&platform=Mac+OSX&function=all">Download
                          Aspera CLI</a> and execute the installation script, e.g., <br/>
                          <code>sh ~/Documents/ibm-aspera-cli-3.9.6.1467.159c5b1-mac-10.11-64-release.sh</code>
                        </li>
                        <li>Switch to the <code>bin</code> folder in the installed directory e.g.,<br/>
                          <code>cd ~/Applications/Aspera\ CLI/bin</code></li>
                        <li>Execute the command<br/> <code>./ascp -P33001 -i ../etc/asperaweb_id_dsa.openssh -d &lt;directory
                          to upload&gt;
                          bsaspera_w@hx-fasp-1.ebi.ac.uk:{{ secret }}</code><br/>
                          , where <code>&lt;directory to upload&gt;</code> is the path of the directory to be uploaded.</li>
                      </ol>
                    </div>
                    <div v-if="selectedOS === 'Linux'">
                      <ol>
                        <li><a target="_blank"
                               href="https://www.ibm.com/support/fixcentral/swg/selectFixes?parent=ibm%7EOther%20software&product=ibm/Other+software/IBM+Aspera+CLI&release=All&platform=Linux&function=all">Download
                          Aspera CLI</a> and execute the installation script, e.g., <br/>
                          <code>sh ~/ibm-aspera-cli-3.9.6.1467.159c5b1-linux-64-release.sh</code>
                        </li>
                        <li>Switch to the <code>bin</code> folder in the installed directory e.g.,<br/>
                          <code>cd ~/.aspera/cli/bin/</code></li>
                        <li>Execute the command<br/> <code>ascp -P33001 -i ../etc/asperaweb_id_dsa.openssh -d &lt;directory
                          to upload&gt;
                          bsaspera_w@hx-fasp-1.ebi.ac.uk:{{ secret }}</code><br/>
                          , where <code>&lt;directory to upload&gt;</code> is the path of the directory to be uploaded.</li>
                      </ol>
                    </div>
                    <div v-if="selectedOS === 'Windows'">
                      <ol>
                        <li><a target="_blank"
                               href="https://www.ibm.com/support/fixcentral/swg/selectFixes?parent=ibm%7EOther%20software&product=ibm/Other+software/IBM+Aspera+CLI&release=All&platform=Windows&function=all">Download
                          Aspera CLI</a> and extract it to a directory such as <code>C:\cli</code>.
                        </li>
                        <li>Open a command window (Win+R, cmd, Enter) and switch to the <code>bin</code> directory e.g.,<br/>
                          <code>cd C:\cli\bin</code></li>
                        <li>Execute the command<br/> <code>ascp.exe -P33001 -i ..\etc\asperaweb_id_dsa.openssh -d &lt;directory
                          to upload&gt;
                          bsaspera_w@hx-fasp-1.ebi.ac.uk:{{ secret }}</code><br/>
                          , where <code>&lt;directory to upload&gt;</code> is the path of the directory to be uploaded.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>
