import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {WELCOME_SVG} from '../../assets/images/assets';
import {useTracked} from '../../provider';
import {DDS} from '../../services/DeviceDetection';
import {eSubscribeEvent, eUnSubscribeEvent} from '../../services/EventManager';
import {getElevation} from '../../utils';
import {eCloseResultDialog, eOpenResultDialog} from '../../utils/Events';
import {ph, SIZE} from '../../utils/SizeUtils';
import {Button} from '../Button';
import BaseDialog from '../Dialog/base-dialog';
import Seperator from '../Seperator';
import Heading from '../Typography/Heading';
import Paragraph from '../Typography/Paragraph';

const ResultDialog = () => {
  const [state, dispatch] = useTracked();
  const {colors} = state;
  const [visible, setVisible] = useState(true);
  const [dialogData, setDialogData] = useState({
    title: 'Welcome to your private\nnote taking haven',
    paragraph: 'Please confirm your email to encrypt and sync all your notes.',
    icon: 'check',
    button: 'Start taking notes',
  });
  useEffect(() => {
    eSubscribeEvent(eOpenResultDialog, open);
    eSubscribeEvent(eCloseResultDialog, close);
    return () => {
      eUnSubscribeEvent(eOpenResultDialog, open);
      eUnSubscribeEvent(eCloseResultDialog, close);
    };
  }, []);

  const open = (data) => {
    setDialogData(data);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  return !visible ? null : (
    <BaseDialog visible={true} onRequestClose={close}>
      <View
        style={{
          ...getElevation(5),
          width: DDS.isTab ? 350 : '85%',
          maxHeight: 350,
          borderRadius: 5,
          backgroundColor: colors.bg,
          paddingHorizontal: ph,
          paddingVertical: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <SvgXml xml={WELCOME_SVG(colors.accent)} width={170} height={170} />

        <Heading
          size={SIZE.lg}
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            marginTop: 10,
            maxWidth: '80%',
          }}>
          {dialogData.title}
        </Heading>
        <Paragraph
          color={colors.icon}
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            maxWidth: '80%',
          }}>
          {dialogData.paragraph}
        </Paragraph>
        <Seperator />
        <Button
          title={dialogData.button}
          width="100%"
          onPress={close}
          fontSize={SIZE.md}
        />
      </View>
    </BaseDialog>
  );
};

export default ResultDialog;
