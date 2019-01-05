import React from 'react';
import cx from 'classnames';
import orderBy from 'lodash/orderBy';

const catStatues = props => {
  let profileProgressions = props.response.profile.profileProgression.data;

  let manifest = props.manifest;

  const { t } = props;

  let list = [];

  Object.entries(profileProgressions.checklists[2726513366]).forEach(([key, value]) => {
    let hash = parseInt(key, 10);

    let completed = value;

    let checklist = false;
    Object.entries(manifest.DestinyChecklistDefinition[2726513366].entries).forEach(([pear, peach]) => {
      if (manifest.DestinyChecklistDefinition[2726513366].entries[pear].hash === hash) {
        checklist = manifest.DestinyChecklistDefinition[2726513366].entries[pear];
        return;
      }
    });

    let number = checklist.displayProperties.name.match(/([0-9]+)/)[0];

    list.push({
      completed: completed ? 1 : 0,
      number: parseInt(number),
      element: (
        <li key={checklist.hash} data-state={completed ? `complete` : `incomplete`} data-sort={number}>
          <div
            className={cx('state', {
              completed: completed
            })}
          />
          <div className='text'>
            <p>
              {t('Feline friend')} {number}
            </p>
          </div>
          <div className='lowlines'>
            <a href={`https://lowlidev.com.au/destiny/maps/2779202173/${checklist.hash}?origin=BRAYTECH`} target='_blank' rel='noopener noreferrer'>
              <i className='uniE1C4' />
            </a>
          </div>
        </li>
      )
    });
  });

  list = orderBy(list, [item => item.number], ['asc']);

  return list;
};

export default catStatues;
