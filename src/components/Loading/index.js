import React from 'react';
import { withNamespaces } from 'react-i18next';
import packageJSON from '../../../package.json';

import './styles.css';

const LOADING_STATE = {
  error: 'Error. Please tweet justrealmilk!',
  checkManifest: 'Checking manifest',
  fetchManifest: 'Downloading manifest',
  setManifest: 'Storing manifest',
  else: 'Booting up'
};

function Loading({ t, state }) {
  const message = LOADING_STATE[state.code] || LOADING_STATE.else;

  return (
    <div className='view' id='loading'>
      <div className='logo-feature'>
        <div className='device'>
          <span className='destiny-clovis_bray_device' />
        </div>
      </div>
      <h4>Braytech {packageJSON.version}</h4>
      <div className='download'>{t(message)}</div>
    </div>
  );
}

export default withNamespaces()(Loading);