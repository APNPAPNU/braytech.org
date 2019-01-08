import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import ProgressCheckbox from '../../components/ProgressCheckbox';
import Button from '../../components/Button';
import { getLanguageInfo } from '../../utils/languageInfo';
import * as ls from '../../utils/localStorage';

import './styles.css';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    let initLanguage = this.props.i18n.getCurrentLanguage();
    
    this.state = {
      language: {
        current: initLanguage,
        selected: initLanguage
      }
    };

    this.saveAndRestart = this.saveAndRestart.bind(this);
  }

  selectCollectibleDisplayState(state) {
    let currentState = this.props.collectibles;
    let newState = currentState;

    if (state === 'showAll') {
      newState = {
        hideTriumphRecords: false,
        hideChecklistItems: false
      };
    } else {
      newState = {
        hideTriumphRecords: state === 'hideTriumphRecords' ? !currentState.hideTriumphRecords : currentState.hideTriumphRecords,
        hideChecklistItems: state === 'hideChecklistItems' ? !currentState.hideChecklistItems : currentState.hideChecklistItems
      };
    }

    this.props.setCollectibleDisplayState(newState);
  }

  selectLanguage(lang) {
    let temp = this.state.language;
    temp.selected = lang;
    this.setState(temp);
  }

  saveAndRestart() {
    console.log(this);
    const { i18n } = this.props;
    i18n.setCurrentLanguage(this.state.language.selected);
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {}

  render() {
    const { t, availableLanguages } = this.props;

    let languageButtons = availableLanguages.map(code => {
      let langInfo = getLanguageInfo(code);
      return (
        <li
          key={code}
          onClick={() => {
            this.selectLanguage(code);
          }}
        >
          <ProgressCheckbox checked={this.state.language.selected === code} text={langInfo.name || langInfo.code} />
        </li>
      );
    });

    let collectiblesButtons = (
      <>
        <li
          key='showAll'
          onClick={() => {
            this.selectCollectibleDisplayState('showAll');
          }}
        >
          <ProgressCheckbox checked={!this.props.collectibles.hideTriumphRecords && !this.props.collectibles.hideChecklistItems} text={t('Show all items')} />
        </li>
        <li
          key='hideTriumphRecords'
          onClick={() => {
            this.selectCollectibleDisplayState('hideTriumphRecords');
          }}
        >
          <ProgressCheckbox checked={this.props.collectibles.hideTriumphRecords} text={t('Hide completed triumphs')} />
        </li>
        <li
          key='hideChecklistItems'
          onClick={() => {
            this.selectCollectibleDisplayState('hideChecklistItems');
          }}
        >
          <ProgressCheckbox checked={this.props.collectibles.hideChecklistItems} text={t('Hide completed checklist items')} />
        </li>
      </>
    );

    return (
      <div className={cx('view', this.props.theme.selected)} id='settings'>
        <div className='module theme'>
          <div className='sub-header sub'>
            <div>{t('Theme')}</div>
          </div>
          <ul className='list settings'>
            <li
              key='light'
              onClick={() => {
                this.props.setTheme('light-mode');
              }}
            >
              <ProgressCheckbox checked={this.props.theme.selected === 'light-mode'} text={t('Lights on')} />
            </li>
            <li
              key='dark'
              onClick={() => {
                this.props.setTheme('dark-mode');
              }}
            >
              <ProgressCheckbox checked={this.props.theme.selected === 'dark-mode'} text={t('Lights off')} />
            </li>
          </ul>
        </div>
        <div className='module language'>
          <div className='sub-header sub'>
            <div>{t('Language')}</div>
          </div>
          <ul className='list settings'>{languageButtons}</ul>
          <Button text={t('Save and restart')} invisible={this.state.language.current === this.state.language.selected} action={this.saveAndRestart} />
        </div>
        <div className='module collectibles'>
          <div className='sub-header sub'>
            <div>{t('Collectibles')}</div>
          </div>
          <ul className='list settings'>{collectiblesButtons}</ul>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  console.log(state, ownProps);
  return {
    profile: state.profile,
    theme: state.theme,
    collectibles: state.collectibles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTheme: value => {
      dispatch({ type: 'SET_THEME', payload: value });
    },
    setCollectibleDisplayState: value => {
      dispatch({ type: 'SET_COLLECTIBLES', payload: value });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withNamespaces()
)(Settings);
