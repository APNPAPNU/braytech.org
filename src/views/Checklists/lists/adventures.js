import React from 'react';
import cx from 'classnames';
import orderBy from 'lodash/orderBy';

const adventures = props => {
  let characterProgressions = props.response.profile.characterProgressions.data;
  let characterId = props.characterId;

  let manifest = props.manifest;

  let list = [];

  Object.entries(characterProgressions[characterId].checklists[4178338182]).forEach(([key, value]) => {
    let hash = parseInt(key, 10);

    let completed = value;

    let checklist = false;
    Object.entries(manifest.DestinyChecklistDefinition[4178338182].entries).forEach(([pear, peach]) => {
      if (manifest.DestinyChecklistDefinition[4178338182].entries[pear].hash === hash) {
        checklist = manifest.DestinyChecklistDefinition[4178338182].entries[pear];
        return;
      }
    });

    let destination = false;
    Object.keys(manifest.DestinyDestinationDefinition).forEach(subKey => {
      if (manifest.DestinyDestinationDefinition[subKey].hash === checklist.destinationHash) {
        destination = manifest.DestinyDestinationDefinition[subKey];
        return;
      }
    });

    let place = false;
    Object.keys(manifest.DestinyPlaceDefinition).forEach(subKey => {
      if (manifest.DestinyPlaceDefinition[subKey].hash === destination.placeHash) {
        place = manifest.DestinyPlaceDefinition[subKey];
        return;
      }
    });

    let adventure = false;
    Object.keys(destination.bubbles).forEach(subKey => {
      if (destination.bubbles[subKey].hash === checklist.bubbleHash) {
        adventure = destination.bubbles[subKey];
        return;
      }
    });

    let activityDef = manifest.DestinyActivityDefinition[checklist.activityHash];

    list.push({
      completed: completed ? 1 : 0,
      place: place.displayProperties.name,
      place2: adventure.displayProperties.name,
      name: activityDef.displayProperties.name,
      element: (
        <li key={checklist.hash}>
          <div
            className={cx('state', {
              completed: completed
            })}
          />
          <div className='text'>
            <p>{activityDef.displayProperties.name}</p>
            <p>
              {adventure.displayProperties.name}, {place.displayProperties.name}
            </p>
          </div>
          <div className='lowlines'>
            <a href={`https://lowlidev.com.au/destiny/maps/${checklist.destinationHash}/${checklist.hash}?origin=BRAYTECH`} target='_blank' rel='noopener noreferrer'>
              <i className='uniE1C4' />
            </a>
          </div>
        </li>
      )
    });
  });

  list = orderBy(list, [item => item.completed, item => item.place, item => item.place2, item => item.name], ['asc', 'asc', 'asc', 'asc']);

  return list;
};

export default adventures;
