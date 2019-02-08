import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import './Core.css';
import './App.css';
import './components/PresentationNode.css';

import './utils/i18n';
import { isProfileRoute, themeOverride } from './utils/globals';
import dexie from './utils/dexie';
import * as bungie from './utils/bungie';
import GoogleAnalytics from './components/GoogleAnalytics';
import getMember from './utils/getMember';
import store from './utils/reduxStore';
import manifest from './utils/manifest';

import Loading from './components/Loading';
import Header from './components/Header';
import Tooltip from './components/Tooltip';
import Footer from './components/Footer';
import NotificationApp from './components/NotificationApp';
import NotificationProgress from './components/NotificationProgress';
import RefreshService from './components/RefreshService';
import ProfileRoutes from './ProfileRoutes';

import Index from './views/Index';
import CharacterSelect from './views/CharacterSelect';
import Clan from './views/Clan';
import Collections from './views/Collections';
import Triumphs from './views/Triumphs';
import Checklists from './views/Checklists';
import Account from './views/Account';
// import Character from './views/Character';
import ThisWeek from './views/ThisWeek';
import Vendors from './views/Vendors';
import Inspect from './views/Inspect';
import Read from './views/Read';
import Settings from './views/Settings';
import Pride from './views/Pride';
import Credits from './views/Credits';
import Resources from './views/Resources';
import ClanBannerBuilder from './views/Resources/ClanBannerBuilder';
import GodRolls from './views/Resources/GodRolls';

import CharacterRoute from './utils/CharacterRoute';

// Print timings of promises to console (and performance logger)
// if we're running in development mode.
async function timed(name, promise) {
  if (process.env.NODE_ENV === 'development') console.time(name);
  const result = await promise;
  if (process.env.NODE_ENV === 'development') console.timeEnd(name);
  return result;
}

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      status: {
        code: false,
        detail: false
      }
    };

    this.currentLanguage = props.i18n.getCurrentLanguage();

    // We do these as early as possible - we don't want to wait
    // for the component to mount before starting the web
    // requests
    this.startupRequests = {
      storedManifest: timed(
        'storedManifest',
        dexie
          .table('manifest')
          .toCollection()
          .first()
      ),
      manifestIndex: timed('getManifestIndex', bungie.manifestIndex()),
      bungieSettings: timed('getSettings', bungie.settings())
    };

    // const member = props.member;

    // if (member && member.membershipId && member.membershipType) {
    //   this.startupRequests.member = timed('getMember', getMember(member.membershipType, member.membershipId));
    // }
  }

  updateViewport = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.setState({
      viewport: {
        width,
        height
      }
    });
  };

  async componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.updateViewport);

    try {
      await timed('setUpManifest', this.setUpManifest());
    } catch (error) {
      console.log(error);
      this.setState({ status: { code: 'error_setUpManifest', detail: error } });
    }
  }

  async setUpManifest() {
    this.setState({ status: { code: 'checkManifest' } });
    const storedManifest = await this.startupRequests.storedManifest;
    const manifestIndex = await this.startupRequests.manifestIndex;

    const currentVersion = manifestIndex.jsonWorldContentPaths[this.currentLanguage];
    let tmpManifest = null;

    if (!storedManifest || currentVersion !== storedManifest.version) {
      // Manifest missing from IndexedDB or doesn't match the current version -
      // download a new one and store it.
      tmpManifest = await this.downloadNewManifest(currentVersion);
    } else {
      tmpManifest = storedManifest.value;
    }

    tmpManifest.settings = await this.startupRequests.bungieSettings;
    this.availableLanguages = Object.keys(manifestIndex.jsonWorldContentPaths);

    // if (this.startupRequests.member) {
    //   try {
    //     this.setState({ status: { code: 'fetchProfile' } });
    //     const data = await this.startupRequests.member;
    //     store.dispatch({
    //       type: 'MEMBER_LOADED',
    //       payload: data
    //     });
    //   } catch (error) {
    //     // Ignore it if we can't load the member on app boot - the user will just
    //     // need to select a new member
    //     console.log(error);
    //   }
    // }

    manifest.set(tmpManifest);

    this.setState({ status: { code: 'ready' } });
  }

  async downloadNewManifest(version) {
    this.setState({ status: { code: 'fetchManifest' } });
    const manifest = await timed('downloadManifest', bungie.manifest(version));

    this.setState({ status: { code: 'setManifest' } });
    try {
      await timed('clearTable', dexie.table('manifest').clear());
      await timed('storeManifest', dexie.table('manifest').add({ version: version, value: manifest }));
    } catch (error) {
      // Can't write a manifest if we're in private mode in safari
      console.warn(`Error while trying to store the manifest in indexeddb: ${error}`);
    }
    return manifest;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport);
  }

  wrapperClassName(route) {
    const override = themeOverride(route.location.pathname);
    return cx('wrapper', override || this.props.theme.selected, {
      'profile-route': isProfileRoute(route.location.pathname, true)
    });
  }

  render() {
    if (!window.ga) {
      GoogleAnalytics.init();
    }

    if (this.state.status.code !== 'ready') {
      return <Loading state={this.state.status} theme={this.props.theme.selected} />;
    }

    return (
      <BrowserRouter>
        <Route
          render={route => (
            <div className={this.wrapperClassName(route)}>
              <NotificationApp updateAvailable={this.props.updateAvailable} />
              {/* <NotificationProgress /> */}

              {/* Don't run the refresh service if we're currently selecting
                a character, as the refresh will cause the member to
                continually reload itself */}
              {/* <Route path='/character-select' children={({ match, ...rest }) => !match && <RefreshService {...this.props} />} /> */}

              <Tooltip {...route} />
              <Route component={GoogleAnalytics.GoogleAnalytics} />
              <div className='main'>
                <Header route={route} {...this.state} {...this.props} themeOverride={themeOverride(route.location.pathname)} />
                <Switch>
                  <Route path='/:membershipType([1|2|4])/:membershipId([0-9]+)/:characterId([0-9]+)' component={ProfileRoutes} />
                  <Route path='/character-select' render={route => <CharacterSelect location={route.location} viewport={this.state.viewport} />} />
                  <Route path='/vendors/:hash?' exact component={Vendors} />
                  <Route path='/inspect/:hash?' exact component={Inspect} />
                  <Route path='/read/:kind?/:hash?' exact component={Read} />
                  <Route path='/settings' exact render={() => <Settings availableLanguages={this.availableLanguages} />} />
                  <Route path='/pride' exact component={Pride} />
                  <Route path='/credits' exact component={Credits} />
                  <Route path='/resources' exact component={Resources} />
                  <Route path='/resources/clan-banner-builder/:decalBackgroundColorId?/:decalColorId?/:decalId?/:gonfalonColorId?/:gonfalonDetailColorId?/:gonfalonDetailId?/:gonfalonId?/' exact component={ClanBannerBuilder} />
                  <Route path='/resources/god-rolls' exact component={GodRolls} />
                  <Route path='/' exact component={Index} />
                </Switch>
              </div>
              <Footer route={route} />
            </div>
          )}
        />
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(App);
