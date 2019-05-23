import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import * as bungie from '../../../utils/bungie';

import manifest from '../../../utils/manifest';
import { ProfileNavLink } from '../../../components/ProfileLink';
import ProgressBar from '../../../components/UI/ProgressBar';
import Spinner from '../../../components/UI/Spinner';
import Mode from '../../../components/PGCRs/Mode';
import Matches from '../../../components/PGCRs/Matches';

class Gambit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  gambit = {
    all: {
      modes: [63, 75, 76],
      stats: {
        // allPvECompetitive: {
        //   mode: 64
        // },
        pvecomp_gambit: {
          mode: 63
        },
        pvecomp_mamba: {
          mode: 75
        },
        enigma: {
          mode: 76
        }
      }
    }
  };

  fetch = async () => {
    const { member } = this.props;

    this.setState(p => {
      p.loading = true;
      return p;
    });

    let stats = await bungie.getHistoricalStats(member.membershipType, member.membershipId, member.characterId, '1', this.gambit.all.modes, '0');

    for (const mode in stats) {
      if (stats.hasOwnProperty(mode)) {
        if (!stats[mode].allTime) {
          return;
        }
        Object.entries(stats[mode].allTime).forEach(([key, value]) => {
          this.gambit.all.stats[mode][key] = value;
        });
      }
    }

    this.setState(p => {
      p.loading = false;
      return p;
    });

    return true;
  };

  componentDidMount() {
    this.refreshData();
    this.startInterval();
  }

  refreshData = async () => {
    if (!this.state.loading) {
      //console.log('refresh start');
      await this.fetch();
      //console.log('refresh end');
    } else {
      //console.log('refresh skipped');
    }
  };

  startInterval() {
    this.refreshDataInterval = window.setInterval(this.refreshData, 30000);
  }

  clearInterval() {
    window.clearInterval(this.refreshDataInterval);
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  render() {
    const { t, member } = this.props;
    const characterId = member.characterId;

    const characterProgressions = member.data.profile.characterProgressions.data;
    const profileRecords = member.data.profile.profileRecords.data.records;

    const infamy = {
      defs: {
        rank: manifest.DestinyProgressionDefinition[2772425241],
        activity: manifest.DestinyActivityDefinition[2274172949]
      },
      progression: {
        data: characterProgressions[characterId].progressions[2772425241],
        total: 0,
        resets: profileRecords[3901785488] ? profileRecords[3901785488].objectives[0].progress : 0
      }
    };

    infamy.progression.total = Object.keys(infamy.defs.rank.steps).reduce((sum, key) => {
      return sum + infamy.defs.rank.steps[key].progressTotal;
    }, 0);

    return (
      <div className={cx('view', 'gambit')} id='multiplayer'>
        <div className='module-l1'>
          <div className='module-l2'>
            <div className='content head'>
              <div className='page-header'>
                <div className='name'>{t('Post Game Carnage Reports')}</div>
                <div className='description'>{t('You know, in case you missed the match summary screen while you were busy being awesome.')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className='module-l1'>
          <div className='content views'>
            <div className='sub-header'>
              <div>Views</div>
            </div>
            <ul className='list'>
              <li className='linked'>
                <ProfileNavLink to='/pgcrs' exact>
                  {t('Summary')}
                </ProfileNavLink>
              </li>
              <li className='linked'>
                <ProfileNavLink to='/pgcrs/crucible'>{t('Crucible')}</ProfileNavLink>
              </li>
              <li className='linked'>
                <ProfileNavLink to='/pgcrs/gambit'>{t('Gambit')}</ProfileNavLink>
              </li>
              {/* <li className='linked'>
                <ProfileNavLink to='/pgcrs/raids'>{t('Raids')}</ProfileNavLink>
              </li>
              <li className='linked'>
                <ProfileNavLink to='/pgcrs/all'>{t('All')}</ProfileNavLink>
              </li> */}
            </ul>
          </div>
          <div className='content career'>
            <div className='sub-header'>
              <div>Career</div>
            </div>
            <div className='doms'>
              <div className='subs'>
                <div className='highlight'>
                  {/* <div className='value'>{this.gambit.all.stats.pvpQuickplay.secondsPlayed ? Math.floor(this.gambit.all.stats.pvpQuickplay.secondsPlayed.basic.value / 60 / 60) : 0} hours</div> */}
                  <div className='name'>Time played</div>
                </div>
                <div className='highlight'>
                  <div className='value progress quickplay'>
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: infamy.defs.rank.displayProperties.name,
                        completionValue: infamy.progression.total
                      }}
                      playerProgress={{
                        progress: infamy.progression.data.currentProgress,
                        objectiveHash: 'infamy'
                      }}
                      hideCheck
                      chunky
                    />
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: `Next rank: ${infamy.defs.rank.currentProgress === infamy.progression.total && infamy.progression.data.stepIndex === infamy.defs.rank.steps.length ? infamy.defs.rank.steps[0].stepName : infamy.defs.rank.steps[(infamy.progression.data.stepIndex + 1) % infamy.defs.rank.steps.length].stepName}`,
                        completionValue: infamy.progression.data.nextLevelAt
                      }}
                      playerProgress={{
                        progress: infamy.progression.data.progressToNextLevel,
                        objectiveHash: 'infamy'
                      }}
                      hideCheck
                      chunky
                    />
                  </div>
                  <div className='name'>Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='module-l1'>
          <div className='content'>
            <div className='sub-header'>
              <div>Modes</div>
            </div>
            {Object.values(this.gambit.all.stats.pvecomp_gambit).length > 1 ? (
              <ul className='list modes'>
                {Object.values(this.gambit.all.stats).map(m => {
                  let paramsMode = this.props.mode ? parseInt(this.props.mode) : 63;
                  let isActive = (match, location) => {
                    if (paramsMode === m.mode) {
                      return true;
                    } else {
                      return false;
                    }
                  };

                  return <Mode key={m.mode} stats={m} isActive={isActive} root='/pgcrs/gambit' defaultMode='63' />;
                })}
              </ul>
            ) : (
              <Spinner mini />
            )}
          </div>
        </div>
        <div className='module-l1' id='matches'>
          <div className='content'>
            <div className='sub-header'>
              <div>Recent matches</div>
            </div>
            <Matches modes={[this.props.mode ? parseInt(this.props.mode) : 63]} characterId={member.characterId} RebindTooltips={this.props.RebindTooltips} />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    PGCRcache: state.PGCRcache
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Gambit);
