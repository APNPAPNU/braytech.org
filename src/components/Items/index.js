import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { orderBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';
import * as enums from '../../utils/destinyEnums';

import './styles.css';

class Items extends React.Component {
  render() {
    const { t, member, items, order, asTab, showHash, inspect, action } = this.props;

    let output = [];

    items.forEach((item, i) => {
      let definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];
      let definitionBucket = item.bucketHash ? manifest.DestinyInventoryBucketDefinition[item.bucketHash] : false;

      if (!definitionItem) {
        console.log(`Items: Couldn't find item definition for ${item.itemHash}`);
        return;
      }

      let bucketName = definitionBucket && definitionBucket.displayProperties && definitionBucket.displayProperties.name && definitionBucket.displayProperties.name.replace(' ', '-').toLowerCase();

      output.push({
        name: definitionItem.displayProperties && definitionItem.displayProperties.name,
        tierType: definitionItem.inventory && definitionItem.inventory.tierType,
        el: (
          <li
            key={i}
            className={cx(
              {
                tooltip: !this.props.disableTooltip,
                linked: true,
                masterworked: enums.enumerateItemState(item.state).masterworked,
                exotic: definitionItem.inventory && definitionItem.inventory.tierType === 6
              },
              bucketName
            )}
            data-hash={item.itemHash}
            data-instanceid={item.itemInstanceId}
            data-state={item.state}
            data-quantity={item.quantity && item.quantity > 1 ? item.quantity : null}
            onClick={e => {
              if (action) {
                action(e, item);
              }
            }}
          >
            <div className='icon'>
              <ObservedImage className='image' src={definitionItem.displayProperties.localIcon ? `${definitionItem.displayProperties.icon}` : `https://www.bungie.net${definitionItem.displayProperties.icon}`} />
            </div>
            {asTab ? (
              <div className='text'>
                <div className='name'>{definitionItem.displayProperties.name}</div>
                {showHash ? <div className='hash'>{definitionItem.hash}</div> : null}
              </div>
            ) : null}
            {inspect && definitionItem.itemHash ? <Link to={{ pathname: `/inspect/${definitionItem.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
            {item.quantity && item.quantity > 1 ? <div className={cx('quantity', { 'max-stack': definitionItem.inventory && definitionItem.inventory.maxStackSize === item.quantity })}>{item.quantity}</div> : null}
          </li>
        )
      });
    });

    output = order ? orderBy(output, [i => i[order], i => i.name], ['desc', 'asc']) : output;

    return output.map(i => i.el);
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Items);
