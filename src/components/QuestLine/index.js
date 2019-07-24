import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import Records from '../Records/';
import Items from '../Items';
import ProgressBar from '../UI/ProgressBar';

import './styles.css';

class QuestLine extends React.Component {
  stepsWithRecords = [
    // From the Mouths of Babes
    {
      objectiveHash: 4280752187,
      recordHash: 1396554507
    },
    // The Ascent
    {
      objectiveHash: 3837519245,
      recordHash: 3026670632
    },
    // Notorious Hustle
    {
      objectiveHash: 1449268997,
      recordHash: 1745790710
    },
    // The Best Offense
    {
      objectiveHash: 858053549,
      recordHash: 1827105928
    }
  ];

  render() {
    const { t, member, item } = this.props;
    const itemComponents = member.data.profile.itemComponents;
    const characterUninstancedItemComponents = member.data.profile.characterUninstancedItemComponents[member.characterId].objectives.data;

    let definitionItem = item && item.itemHash && manifest.DestinyInventoryItemDefinition[item.itemHash];

    if (definitionItem && definitionItem.objectives && definitionItem.objectives.questlineItemHash) {
      definitionItem = manifest.DestinyInventoryItemDefinition[definitionItem.objectives.questlineItemHash];
    }

    if (definitionItem && definitionItem.setData && definitionItem.setData.itemList && definitionItem.setData.itemList.length) {
      const questLine = definitionItem;

      let assumeCompleted = true;
      const steps = {...questLine.setData}.itemList.map((s, i) => {
        s.i = i + 1;
        s.definitionStep = manifest.DestinyInventoryItemDefinition[s.itemHash];
        s.completed = assumeCompleted;

        if (s.itemHash === item.itemHash) {
          assumeCompleted = false;
          s.completed = false;
          s.active = true;
          s.itemInstanceId = item.itemInstanceId || null;
        }

        let progressData = item.itemInstanceId && itemComponents.objectives.data[item.itemInstanceId] ? itemComponents.objectives.data[item.itemInstanceId].objectives : characterUninstancedItemComponents && characterUninstancedItemComponents[item.itemHash] ? characterUninstancedItemComponents[item.itemHash].objectives : false;

        let stepMatch = false;
        if (progressData && s.definitionStep.objectives && s.definitionStep.objectives.objectiveHashes.length === progressData.length) {
          progressData.forEach(o => {
            if (s.definitionStep.objectives.objectiveHashes.includes(o.objectiveHash)) {
              stepMatch = true;
            } else {
              stepMatch = false;
            }
          });
        }

        if (stepMatch) {
          s.progress = progressData;
        } else if (assumeCompleted && s.definitionStep.objectives && s.definitionStep.objectives.objectiveHashes.length) {
          s.progress = s.definitionStep.objectives.objectiveHashes.map(o => {
            let definitionObjective = manifest.DestinyObjectiveDefinition[o];

            return {
              complete: true,
              progress: definitionObjective.completionValue,
              objectiveHash: definitionObjective.hash
            };
          });
        } else {
          s.progress = [];
        }

        return s;
      });

      const questLineSource = questLine.sourceData && questLine.sourceData.vendorSources && questLine.sourceData.vendorSources.length ? questLine.sourceData.vendorSources : steps[0].definitionStep.sourceData && steps[0].definitionStep.sourceData.vendorSources && steps[0].definitionStep.sourceData.vendorSources.length ? steps[0].definitionStep.sourceData.vendorSources : false;

      const descriptionQuestLine = questLine.displaySource && questLine.displaySource !== '' ? questLine.displaySource : questLine.displayProperties.description && questLine.displayProperties.description !== '' ? questLine.displayProperties.description : steps[0].definitionStep.displayProperties.description;

      const rewards = (questLine.value && questLine.value.itemValue.length && questLine.value.itemValue.filter(v => v.itemHash !== 0 && v.quantity > 0)) || [];

      return (
        <div className='quest-line'>
          <div className='module header'>
            <div className='name'>{questLine.displayProperties.name}</div>
          </div>
          <div className='module'>
            <ReactMarkdown className='displaySource' source={descriptionQuestLine} />
            {rewards.length ? (
              <>
                <h4>{t('Rewards')}</h4>
                <ul className='list inventory-items'>
                  <Items items={rewards} />
                </ul>
              </>
            ) : null}
            {questLineSource ? (
              <>
                <h4>{t('Source')}</h4>
                {questLineSource.map(s => {
                  if (s.vendorHash) {
                    let definitionVendor = manifest.DestinyVendorDefinition[s.vendorHash];
                    let definitionFaction = definitionVendor && definitionVendor.factionHash ? manifest.DestinyFactionDefinition[definitionVendor.factionHash] : false;

                    return (
                      <div key={s.vendorHash} className='vendor'>
                        <div className='name'>{definitionVendor.displayProperties.name}</div>
                        {definitionFaction ? <div className='faction'>{definitionFaction.displayProperties.name}</div> : null}
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </>
            ) : null}
            {steps.length > 3 ? (
              <>
                <h4>{t('Current step')}</h4>
                <div className='steps'>
                  {steps
                    .filter(s => s.active)
                    .map(s => {
                      let objectives = [];
                      s.definitionStep &&
                        s.definitionStep.objectives &&
                        s.definitionStep.objectives.objectiveHashes.forEach(element => {
                          let definitionObjective = manifest.DestinyObjectiveDefinition[element];

                          let progress = {
                            ...{
                              complete: false,
                              progress: 0,
                              objectiveHash: definitionObjective.hash
                            },
                            ...s.progress.find(o => o.objectiveHash === definitionObjective.hash)
                          };

                          let relatedRecords = this.stepsWithRecords.filter(r => r.objectiveHash === definitionObjective.hash).map(r => r.recordHash);
                          
                          objectives.push(
                            <React.Fragment key={definitionObjective.hash}>
                              <ProgressBar objective={definitionObjective} progress={progress} />
                              {relatedRecords && relatedRecords.length ? (
                                <ul className='list record-items'>
                                  <Records selfLinkFrom={`/inventory/pursuits/${item.itemHash}`} forceDisplay {...this.props} hashes={relatedRecords} />
                                </ul>
                              ) : null}
                            </React.Fragment>
                          );
                        });

                      const descriptionStep = s.definitionStep.displayProperties.description && s.definitionStep.displayProperties.description !== '' ? s.definitionStep.displayProperties.description : false;

                      return (
                        <div key={s.itemHash} className='step'>
                          <div className='header'>
                            <div className='number'>{s.i}</div>
                            <div className='name'>{s.definitionStep.displayProperties.name}</div>
                          </div>
                          {descriptionStep ? <ReactMarkdown className='description' source={descriptionStep} /> : null}
                          {objectives.length ? <div className='objectives'>{objectives}</div> : null}
                        </div>
                      );
                    })}
                </div>
              </>
            ) : null}
          </div>
          <div className='module'>
            <h4>{t('Steps')}</h4>
            <div className='steps'>
              {steps.map(s => {
                let objectives = [];
                s.definitionStep &&
                  s.definitionStep.objectives &&
                  s.definitionStep.objectives.objectiveHashes.forEach(element => {
                    let definitionObjective = manifest.DestinyObjectiveDefinition[element];

                    let progress = {
                      ...{
                        complete: false,
                        progress: 0,
                        objectiveHash: definitionObjective.hash
                      },
                      ...s.progress.find(o => o.objectiveHash === definitionObjective.hash)
                    };

                    let relatedRecords = this.stepsWithRecords.filter(r => r.objectiveHash === definitionObjective.hash).map(r => r.recordHash);

                    objectives.push(
                      <React.Fragment key={definitionObjective.hash}>
                        <ProgressBar objective={definitionObjective} progress={progress} />
                        {relatedRecords && relatedRecords.length ? (
                          <ul className='list record-items'>
                            <Records selfLinkFrom={`/inventory/pursuits/${item.itemHash}`} forceDisplay {...this.props} hashes={relatedRecords} />
                          </ul>
                        ) : null}
                      </React.Fragment>
                    );
                  });

                const descriptionStep = s.definitionStep.displayProperties.description && s.definitionStep.displayProperties.description !== '' ? s.definitionStep.displayProperties.description : false;

                return (
                  <div key={s.itemHash} className={cx('step', { completed: s.completed })}>
                    <div className='header'>
                      <div className='number'>{s.i}</div>
                      <div className='name'>{s.definitionStep.displayProperties.name}</div>
                    </div>
                    {descriptionStep ? <ReactMarkdown className='description' source={descriptionStep} /> : null}
                    {objectives.length ? <div className='objectives'>{objectives}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(QuestLine);
