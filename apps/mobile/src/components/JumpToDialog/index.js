import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import BaseDialog from '../../components/Dialog/base-dialog';
import {PressableButton} from '../../components/PressableButton';
import Seperator from '../../components/Seperator';
import {useTracked} from '../../provider';
import {DDS} from '../../services/DeviceDetection';
import {eSubscribeEvent, eUnSubscribeEvent} from '../../services/EventManager';
import {getElevation, } from '../../utils';
import {
  eCloseJumpToDialog,
  eOpenJumpToDialog,
  eScrollEvent,
} from '../../utils/Events';
import {SIZE} from '../../utils/SizeUtils';
import Heading from '../Typography/Heading';

const offsets = [];
let timeout = null;
const JumpToDialog = ({scrollRef}) => {
  const [state] = useTracked();
  const {notes, colors, settings} = state;
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  const onPress = (item, index) => {
    let offset = 35 * index;
    let ind = notes.findIndex(
      (i) => i.title === item.title && i.type === 'header',
    );
    ind = ind + 1;
    ind = ind - (index + 1);
    offset = offset + ind * 100 + 200;
    scrollRef.current?.scrollToOffset(0, index === 0 ? 0 : offset, true);
    close();
  };

  useEffect(() => {
    eSubscribeEvent(eOpenJumpToDialog, open);
    eSubscribeEvent(eCloseJumpToDialog, close);
    eSubscribeEvent(eScrollEvent, onScroll);

    return () => {
      eUnSubscribeEvent(eOpenJumpToDialog, open);
      eUnSubscribeEvent(eCloseJumpToDialog, close);
      eUnSubscribeEvent(eScrollEvent, onScroll);
    };
  }, []);

  const onScroll = (y) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      let index = offsets.findIndex((o, i) => o <= y && offsets[i + 1] > y);
      setCurrentIndex(index);
    }, 200);
  };

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  useEffect(() => {
    loadOffsets();
  }, [notes]);

  const loadOffsets = () => {
    notes
      .filter((i) => i.type === 'header')
      .map((item, index) => {
        let offset = 35 * index;
        let ind = notes.findIndex(
          (i) => i.title === item.title && i.type === 'header',
        );
        ind = ind + 1;
        ind = ind - (index + 1);
        offset = offset + ind * 100 + 190;
        offsets.push(offset);
      });
  };

  return !visible ? null : (
    <BaseDialog
      onShow={() => {
        loadOffsets();
      }}
      onRequestClose={close}
      visible={true}>
      <View
        style={{
          ...getElevation(5),
          width: DDS.isTab ? 500 : '85%',
          backgroundColor: colors.bg,
          zIndex: 100,
          bottom: 20,
          maxHeight: '65%',
          borderRadius: 5,
          alignSelf: 'center',
          padding: 10,
        }}>
        <Heading
          size={SIZE.xl}
          style={{
            alignSelf: 'center',
          }}>
          {settings.sort.slice(0, 1).toUpperCase() +
            settings.sort.slice(1, settings.sort.length)}
        </Heading>
        <Seperator />
        <ScrollView
          style={{
            maxHeight: '100%',
          }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignSelf: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
            }}>
            <PressableButton
              key="go to top"
              onPress={() => {
                scrollRef.current?.scrollToOffset(0, 0, true);
                close()
              }}
              type='shade'
              customStyle={{
                minWidth: '20%',
                maxWidth: '46%',
                width: null,
                paddingHorizontal: 10,
                margin: 5,
                borderRadius: 100,
                height: 22,
              }}>
              <Heading
                size={SIZE.sm}
                color={colors.accent}
                style={{
                  textAlign: 'center',
                }}>
                Top
              </Heading>
            </PressableButton>
            {notes
              .filter((i) => i.type === 'header')
              .map((item, index) => {
                return item.title ? (
                  <PressableButton
                    key={item.title}
                    onPress={() => onPress(item, index)}
                    type={currentIndex === index ? 'accent' : 'shade'}
                    customStyle={{
                      minWidth: '20%',
                      maxWidth: '46%',
                      width: null,
                      paddingHorizontal: 0,
                      margin: 5,
                      borderRadius: 100,
                      height: 22,
                    }}>
                    <Heading
                      size={SIZE.sm}
                      color={
                        currentIndex === index ? colors.light : colors.accent
                      }
                      style={{
                        textAlign: 'center',
                      }}>
                      {item.title}
                    </Heading>
                  </PressableButton>
                ) : null;
              })}
          </View>
        </ScrollView>
      </View>
    </BaseDialog>
  );
};

export default JumpToDialog;
